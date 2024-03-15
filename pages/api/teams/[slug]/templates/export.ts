import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { createTemplate, getTemplate } from 'models/template';
import jsdom from 'jsdom'

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

    const { templateId, emailContent }: {
      emailContent: {
        title: string;
        date: string;
        introduction: string;
        articles: {
          title: string;
          body: string;
          image: string;
          selector: string;
        }[];
        stories: {
          title: string;
          link: string;
          selector: string;
        }[];
        update: {
          essay: string;
          selector: string;
        };
      };
      templateId: string;
    } = req.body;

    const articles = JSON.parse(JSON.parse(JSON.stringify(emailContent.articles)));
    const stories = JSON.parse(JSON.parse(JSON.stringify(emailContent.stories)));

    if (!articles.length || !stories.length) {
      throw new Error('Articles and stories are required');
    }

    emailContent.articles = articles;
    emailContent.stories = stories;
    const template = await getTemplate({id: templateId as string});

    if (!template) {
      throw new Error('Template not found');
    }

    recordMetric('template.fetched');
    
    let content = wrapHTMLMarkup(template.content, template.backgroundColor);
    
    try {
      content = addDateToHeader(content, emailContent.date)
      content = addIntroductionParagraph(content, emailContent.introduction)

      for (let i = 0; i < emailContent.articles.length; i++) {
        content = addArticleToTemplate(content, emailContent.articles[i])
      }

      for (let i = 0; i < emailContent.stories.length; i++) {
        content = addLinkToTemplate(content, emailContent.stories[i])
      }

      content = addCompanyUpdateToTemplate(content, emailContent.update)
    }

    catch (error: any) {
      throw new Error(error.message);
    }

    const templateCreated = await createTemplate({
      teamId: template.teamId,
      title: emailContent.title,
      content: content,
      authorId: template.authorId,
      backgroundColor: template.backgroundColor,
      image: template.image,
      description: ''
    })

    recordMetric('template.created');
  
    res.status(200).json({ data: templateCreated });
  };

  function getDocumentFromMarkup(markup:string):Document {
    return new jsdom.JSDOM(markup).window.document
  }
  
  function addDateToHeader(markup:string, date:string){
    try {
      const doc = getDocumentFromMarkup(markup)
      const header = doc.getElementsByTagName('h1')[0]
      header.style.fontSize='60pt';
      header.innerHTML = updateInnerHTMLText(header.innerHTML, date.toUpperCase() + ' ' + header.textContent);
      return doc.body.outerHTML;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  function addIntroductionParagraph (markup: string, introduction: string) {
    try {
      const doc = getDocumentFromMarkup(markup)
      const introductionParagraph = doc.createElement('p')
      introductionParagraph.style.color=styles.paragraph.color;
      introductionParagraph.style.fontSize=styles.paragraph['font-size'];
      introductionParagraph.style.fontFamily=styles.paragraph['font-family'];
      introductionParagraph.textContent = introduction
      doc.getElementsByTagName('h2')[0].insertAdjacentElement('beforeend', introductionParagraph);
      // blank line
      doc.getElementsByTagName('h2')[0].insertAdjacentElement('beforeend', doc.createElement('p'));
      return doc.documentElement.outerHTML
    }
    catch (error: any) {
      throw new Error(error.message);
    }
  }

  function addArticleToTemplate(markup: string, content: { title: string, body: string, image: string, selector: string }):string {
    try {
      const addArticle = wrapArticleContent(content.title, content.body, content.image)
      const doc = getDocumentFromMarkup(markup)
      const articleSection = doc.getElementsByTagName(content.selector)[0]
      const articleSectionInnerHTML = articleSection.innerHTML;
      articleSection.innerHTML = articleSectionInnerHTML + addArticle;
      return doc.documentElement.outerHTML
      } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  function addLinkToTemplate(markup: string, content: { title: string, link: string, selector: string }) {
    try {
      const addLink = wrapStoryLinks(content.title, content.link)
      const doc = getDocumentFromMarkup(markup)
      const linkSection = doc.getElementsByTagName(content.selector)[1]
      const linkSectionInnerHTML = linkSection.innerHTML;
      linkSection.innerHTML = linkSectionInnerHTML + addLink;
      return doc.documentElement.outerHTML
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  function addCompanyUpdateToTemplate (markup: string, content: { essay: string, selector: string }) {
    try {
      const doc = getDocumentFromMarkup(markup)
      const essayParagraph = doc.createElement('p')
      essayParagraph.style.color=styles.paragraph.color;
      essayParagraph.style.fontSize=styles.paragraph['font-size'];
      essayParagraph.style.fontFamily=styles.paragraph['font-family'];
      essayParagraph.textContent = content.essay
      doc.getElementsByTagName(content.selector)[2].insertAdjacentElement('beforeend', essayParagraph);
      doc.getElementsByTagName(content.selector)[2].insertAdjacentElement('beforeend', doc.createElement('p'));
      return doc.documentElement.outerHTML
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  function wrapArticleContent(title: string, body:string, imagesrc:string) {
    return `<p style="text-align: center;"><span style="font-family: ${styles.paragraph['font-family']}; color: ${styles.paragraph.color}; font-size: ${styles.paragraph['font-size']};"><strong>${title}</strong></span></p><p><img style="display: block; margin-left: auto; margin-right: auto;" src=${imagesrc} alt=${title} width="200px" /></p><p><span style="font-family: ${styles.paragraph['font-family']}; color: ${styles.paragraph.color}; font-size: ${styles.paragraph['font-size']};">${body}</span></p><p></p>`
  }
  
  function wrapStoryLinks(title: string, link:string) {
    return `<p style="text-align: center;"><span style="font-family: ${styles.paragraph['font-family']}; color: ${styles.paragraph.color}; font-size: ${styles.paragraph['font-size']};"><strong><a style="font-family: ${styles.paragraph['font-family']}; color: ${styles.paragraph.color}; font-size: ${styles.paragraph['font-size']};" title=${title} href=${link} target="_blank" rel="noopener" aria-invalid="true">Cannabis Doctor recommends smoking weed every day</a></strong></span></p><p></p>`
  }

  function wrapHTMLMarkup(markup: string, backgroundColor: string) {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="max-width: 600px; background-color: ${backgroundColor}; margin-left: auto; margin-right: auto; padding-top:20px;">${markup}</body></html>`
  }

  function updateInnerHTMLText(innerHTML, newText) {
    // Find the position of the opening and closing tags of the element containing the text
    const openingTagIndex = innerHTML.indexOf('>') + 1;
    const closingTagIndex = innerHTML.lastIndexOf('<');

    // Extract the text content from the innerHTML
    const textContent = innerHTML.substring(openingTagIndex, closingTagIndex);

    // Replace the old text content with the new text content
    const updatedInnerHTML = innerHTML.replace(textContent, newText);

    return updatedInnerHTML;
}

const styles = {
  paragraph: {
    color: 'rgb(52, 73, 94)',
    'font-size': '12pt',
    'font-family': 'arial, helvetica, sans-serif'
  }
}