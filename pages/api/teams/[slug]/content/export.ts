import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { createEmail } from 'models/email';
import jsdom from 'jsdom';
import { getContent } from 'models/content';
import { getTemplate } from 'models/template';
import { getTeam, getTeamMember } from 'models/team';
import { getApiKey } from 'models/apiKey';
import { throwIfNotAllowed } from 'models/user';
import { GoogleSheetData, fetchGoogleSheet } from '@/lib/google-sheet';
import html2canvas from 'html2canvas-pro';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'POST');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

// Create a new template with the content from the request
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiKey = await getApiKey(req.headers['api-key'] as string);
  if (!apiKey) {
    throw new Error('A valid API key is required.');
  }
  const { userId, teamId } = apiKey;
  const team = await getTeam({ id: teamId });
  const teamMember = await getTeamMember(userId, team.slug);
  throwIfNotAllowed(teamMember, 'team_content', 'read');

  const {
    contentId,
    lookupField,
    lookupValue,
  }: {
    contentId: string;
    lookupField: string;
    lookupValue: string;
  } = req.body;

  if (!contentId) {
    throw new Error('Content ID is required.');
  }

  const contentMap = await getContent({ id: contentId });

  if (!contentMap) {
    throw new Error('Content is not found.');
  }

  if (!contentMap.templateId) {
    throw new Error('Content is not bind to a template.');
  }

  recordMetric('content.fetched');

  const template = await getTemplate({ id: contentMap.templateId });

  if (!template) {
    throw new Error('Template is not found.');
  }

  const googleSheet = (await fetchGoogleSheet({
    req,
    res,
    userId,
    sheetId: contentMap.sourceId,
    range: contentMap.sourceRange || '',
  })) as GoogleSheetData;

  const content = composeHTML({
    document: template.doc,
    backgroundColor: template.backgroundColor,
    contentFields: contentMap.contentFields,
    data: googleSheet.values,
    lookupField,
    lookupValue,
    headerOrientation: contentMap.headerOrientation,
  });

  const email = await createEmail({
    teamId: template.teamId,
    title: contentMap.title + new Date().toISOString(),
    doc: content,
    authorId: template.authorId,
    backgroundColor: template.backgroundColor,
    image: encodeURIComponent(
      await (
        await html2canvas(
          getDocumentFromMarkup(content).getElementsByTagName(
            'html'
          )[0] as HTMLElement
        )
      ).toDataURL('image/png')
    ),
    description: template.description,
  });

  recordMetric('email.created');

  res.status(200).json({ data: email });
};

function composeHTML({
  document,
  backgroundColor,
  contentFields,
  data,
  lookupField,
  lookupValue,
  headerOrientation,
}: {
  document: string;
  backgroundColor: string;
  contentFields: string[];
  data: GoogleSheetData['values'];
  lookupField: string;
  lookupValue: string;
  headerOrientation: 'vertical' | 'horizontal';
}) {
  const doc = getDocumentFromMarkup(document);
  const headerRow = getRow(0);

  function getRow(index: number) {
    return headerOrientation === 'horizontal'
      ? data[index]
      : data.map((row) => row[index]);
  }
  function getCrossAxisRow(index: number) {
    return headerOrientation === 'vertical'
      ? data[index]
      : data.map((row) => row[index]);
  }

  try {
    for (const contentPair of contentFields as string[]) {
      const [templateField, contentField] = contentPair.split(':');

      if (!headerRow.length || headerRow.length === 0) {
        throw new Error('No data found.');
      }

      // Find the index of the lookup column
      const lookupValueIndex = headerRow.indexOf(lookupField);
      if (lookupValueIndex === -1) {
        throw new Error('Lookup column not found.');
      }
      const lookupColumn = getCrossAxisRow(lookupValueIndex);
      // Search for the row containing the lookup value
      const dataRowIndex = lookupColumn.indexOf(lookupValue);
      if (dataRowIndex === -1) {
        throw new Error('Lookup value not found.');
      }
      // Extract data according to the provided contentFields
      const contentRow = getRow(dataRowIndex);
      const content = contentRow[headerRow.indexOf(contentField)];

      const element = doc.getElementById(templateField);
      if (!element) {
        throw new Error('Element not found.');
      }

      if (contentField.includes('image')) {
        addImage({ document: doc, element, src: content, alt: contentField });
      } else if (contentField.includes('link')) {
        addLink({
          document: doc,
          element,
          href: content,
          title: `Get more info`,
        });
      } else {
        updateInnerHTML({ element, text: content });
      }
      console.info('updated document ', doc.documentElement.outerHTML);
    }
    return wrapHTMLMarkup(doc.documentElement.outerHTML, backgroundColor);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

function addLink({
  document,
  element,
  href,
  title,
}: {
  document: Document;
  element: HTMLElement;
  href: string;
  title: string;
}) {
  try {
    const link = document.createElement('a');
    link.style.display = 'block';
    link.style.color = styles.paragraph.color['dark'];
    link.style.fontSize = styles.paragraph['font-size'];
    link.style.fontFamily = styles.paragraph['font-family'];
    link.title = title;
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener';
    link.ariaInvalid = 'true';
    link.textContent = title;

    element.insertAdjacentElement('beforeend', link);
    element.insertAdjacentHTML('beforeend', '<br />');
  } catch (error: any) {
    throw new Error(error.message);
  }
}

function addImage({
  document,
  element,
  src,
  alt,
}: {
  document: Document;
  element: HTMLElement;
  src: string;
  alt: string;
}) {
  try {
    const image = document.createElement('img');
    image.src = src;
    image.alt = alt;
    image.style.width = '100%';
    image.style.display = 'block';
    image.style.marginLeft = 'auto';
    image.style.marginRight = 'auto';

    element.insertAdjacentElement('beforeend', image);
    element.insertAdjacentHTML('beforeend', '<br />');
  } catch (error: any) {
    throw new Error(error.message);
  }
}

function updateInnerHTML({
  element,
  text,
}: {
  element: HTMLElement;
  text: string;
}) {
  if (element) {
    element.textContent = `${element.textContent} ${text}`;
    // // append text to existing innerHTML
    // element.innerHTML = `${element.innerHTML} ${text}`;
    // Find the position of the opening and closing tags of the element containing the text
    // const openingTagIndex = element.innerHTML.indexOf('>') + 1;
    // const closingTagIndex = element.innerHTML.lastIndexOf('<');

    // Extract the innermost text content from the innerHTML
    // const textContent = element.innerHTML.substring(
    //   openingTagIndex,
    //   closingTagIndex
    // );
  }
}

function wrapHTMLMarkup(markup: string, backgroundColor: string) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="max-width: 600px; background-color: ${backgroundColor}; margin-left: auto; margin-right: auto; padding-top:20px;">${markup}</body></html>`;
}

function getDocumentFromMarkup(markup: string): Document {
  return new jsdom.JSDOM(markup).window.document;
}

const styles = {
  paragraph: {
    color: {
      dark: 'rgb(52, 73, 94)',
      light: 'rgb(149, 165, 166)',
    },
    'font-size': '12pt',
    'font-family': 'arial, helvetica, sans-serif',
  },
};
