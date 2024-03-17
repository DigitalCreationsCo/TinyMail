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
        stories?: {
          title: string;
          link: string;
          selector: string;
        }[];
        artStory?: {
          title: string;
          body: string;
          image: string;
          link: string;
          selector: string;
        };
        update: {
          essay: string;
          selector: string;
        };
      };
      templateId: string;
    } = req.body;

    let articles, stories, artStory;
    if (emailContent.articles) {
      articles = JSON.parse(JSON.parse(JSON.stringify(emailContent.articles)));
      emailContent.articles = articles;
    }

    if (emailContent.stories) {
      stories = JSON.parse(JSON.parse(JSON.stringify(emailContent.stories)));
      emailContent.stories = stories;
    }

    if (emailContent.artStory) {
      artStory = JSON.parse(JSON.stringify(emailContent.artStory));
      emailContent.artStory = artStory;
    }

    if (!articles.length) {
      throw new Error('Articles are required');
    }

    const template = await getTemplate({id: templateId as string});

    if (!template) {
      throw new Error('Template not found');
    }

    recordMetric('template.fetched');
    
    let content = wrapHTMLMarkup(template.content, template.backgroundColor);

    const textColor = templateId === '9059e1d1-f9fb-483d-b3e0-5d983102b996' ? 'light' : 'dark';
    
    try {
      content = addDateToHeader(content, emailContent.date)
      if (emailContent.introduction){
        content = addIntroductionParagraph(content, emailContent.introduction)
      }

      for (let i = 0; i < emailContent.articles.length; i++) {
        content = addArticleToTemplate(content, emailContent.articles[i], textColor)
      }

      if (emailContent.stories && emailContent.stories.length){
        for (let i = 0; i < emailContent.stories.length; i++) {
          content = addLinkToTemplate(content, emailContent.stories[i], textColor)
        }
      }

      if (emailContent.artStory){
        content = addArtStoryToTemplate(content, emailContent.artStory, textColor)
      }

      content = addCompanyUpdateToTemplate(content, emailContent.update, textColor)
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
      if (header) {
        header.style.fontSize='60pt';
        header.style.wordBreak='break-all';
        header.innerHTML = updateInnerHTMLText(header.innerHTML, (date.toUpperCase() + ' ' + header.textContent).replace(" ", ""))
      }
      return doc.body.outerHTML;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  function addIntroductionParagraph (markup: string, introduction: string, textColor: 'light' | 'dark' = 'dark') {
    try {
      const doc = getDocumentFromMarkup(markup)
      const introductionParagraph = doc.createElement('p')
      introductionParagraph.style.color=styles.paragraph.color[textColor];
      introductionParagraph.style.fontSize=styles.paragraph['font-size'];
      introductionParagraph.style.fontFamily=styles.paragraph['font-family'];
      // normal font weight
      introductionParagraph.style.fontWeight='normal';
      introductionParagraph.style.textAlign='left';
      introductionParagraph.textContent = introduction
      doc.getElementsByTagName('h2')[0].insertAdjacentElement('beforeend', introductionParagraph);
      // blank line
      doc.getElementsByTagName('h2')[0].insertAdjacentHTML('beforeend', '<br />');

      return doc.documentElement.outerHTML
    }
    catch (error: any) {
      throw new Error(error.message);
    }
  }

  function addArticleToTemplate(markup: string, content: { title: string, body: string, image: string, selector: string }, textColor: 'light' | 'dark'):string {
    try {
      const doc = getDocumentFromMarkup(markup)
      const articleSection = doc.getElementsByTagName(content.selector)[0]
      
      const addTitle = doc.createElement('p')
      addTitle.style.color=styles.paragraph.color[textColor];
      addTitle.style.fontSize=styles.paragraph['font-size'];
      addTitle.style.fontFamily=styles.paragraph['font-family'];
      addTitle.style.fontWeight='bold';
      addTitle.textContent = content.title

      const addImage = doc.createElement('img')
      addImage.src=content.image
      addImage.alt=content.title
      addImage.style.width='100%'
      addImage.style.display='block'
      addImage.style.marginLeft='auto'
      addImage.style.marginRight='auto'

      const addBody = doc.createElement('p')
      addBody.style.color=styles.paragraph.color[textColor];
      addBody.style.fontSize=styles.paragraph['font-size'];
      addBody.style.fontFamily=styles.paragraph['font-family'];
      addBody.style.textAlign='left';
      addBody.style.fontWeight='normal';
      addBody.textContent = content.body

      // insert addArticle after the articleSection
      articleSection.insertAdjacentElement('beforeend', addTitle);
      articleSection.insertAdjacentElement('beforeend', addImage);
      articleSection.insertAdjacentHTML('beforeend', '<br />');
      articleSection.insertAdjacentElement('beforeend', addBody);
      articleSection.insertAdjacentHTML('beforeend', '<br />');

      return doc.documentElement.outerHTML
      } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  function addLinkToTemplate(markup: string, content: { title: string, link: string, selector: string }, textColor: 'light' | 'dark') {
    try {
      const doc = getDocumentFromMarkup(markup)

      const addLink = doc.createElement('a')
      addLink.style.display='block';
      addLink.style.color=styles.paragraph.color[textColor];
      addLink.style.fontSize=styles.paragraph['font-size'];
      addLink.style.fontFamily=styles.paragraph['font-family'];
      addLink.title=content.title
      addLink.href=content.link
      addLink.target='_blank'
      addLink.rel='noopener'
      addLink.ariaInvalid='true'
      addLink.textContent = content.title

      const linkSection = doc.getElementsByTagName(content.selector)[1]
      linkSection.insertAdjacentElement('beforeend', addLink);
      linkSection.insertAdjacentHTML('beforeend', '<br />');

      return doc.documentElement.outerHTML
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  function addArtStoryToTemplate(markup: string, content: { title: string, body: string, link: string, image: string, selector: string }, textColor: 'light' | 'dark'):string {
    try {
      const doc = getDocumentFromMarkup(markup)
      const articleSection = doc.getElementsByTagName(content.selector)[1]
      
      const addTitle = doc.createElement('p')
      addTitle.style.color=styles.paragraph.color[textColor];
      addTitle.style.fontSize=styles.paragraph['font-size'];
      addTitle.style.fontFamily=styles.paragraph['font-family'];
      addTitle.style.fontWeight='bold';
      addTitle.textContent = content.title

      const addImage = doc.createElement('img')
      addImage.src=content.image
      addImage.alt=content.title
      addImage.style.width='100%'
      addImage.style.display='block'
      addImage.style.marginLeft='auto'
      addImage.style.marginRight='auto'

      const addBody = doc.createElement('p')
      addBody.style.color=styles.paragraph.color[textColor];
      addBody.style.fontSize=styles.paragraph['font-size'];
      addBody.style.fontFamily=styles.paragraph['font-family'];
      addBody.style.textAlign='left';
      addBody.style.fontWeight='normal';
      addBody.textContent = content.body

      // insert addArticle after the articleSection
      articleSection.insertAdjacentElement('beforeend', addTitle);
      articleSection.insertAdjacentElement('beforeend', addImage);
      articleSection.insertAdjacentHTML('beforeend', '<br />');
      articleSection.insertAdjacentElement('beforeend', addBody);
      articleSection.insertAdjacentHTML('beforeend', '<br />');

      return doc.documentElement.outerHTML
      } catch (error: any) {
      throw new Error(error.message);
    }
  }

  function addCompanyUpdateToTemplate (markup: string, content: { essay: string, selector: string }, textColor: 'light' | 'dark') {
    try {
      const doc = getDocumentFromMarkup(markup)
      const essayParagraph = doc.createElement('p')
      essayParagraph.style.color=styles.paragraph.color[textColor];
      essayParagraph.style.fontSize=styles.paragraph['font-size'];
      essayParagraph.style.fontFamily=styles.paragraph['font-family'];
      essayParagraph.style.textAlign='left';
      essayParagraph.textContent = content.essay
      essayParagraph.style.fontWeight='normal';
      doc.getElementsByTagName(content.selector)[2].insertAdjacentElement('beforeend', essayParagraph);
      doc.getElementsByTagName(content.selector)[2].insertAdjacentHTML('beforeend', '<br />');

      const allParagraphs = doc.getElementsByTagName('p')
      for(let i = 0; i < allParagraphs.length; i++) {
        allParagraphs[i].style.fontFamily = styles.paragraph['font-family'];
      }

      const allH2 = doc.getElementsByTagName('h2')
      for(let i = 0; i < allH2.length; i++) {
        allH2[i].style.fontFamily = styles.paragraph['font-family'];
      }

      const allH3 = doc.getElementsByTagName('h3')
      for(let i = 0; i < allH3.length; i++) {
        allH3[i].style.fontFamily = styles.paragraph['font-family'];
      }

      const allH4 = doc.getElementsByTagName('h4')
      for(let i = 0; i < allH4.length; i++) {
        allH4[i].style.fontFamily = styles.paragraph['font-family'];
      }

      return doc.documentElement.outerHTML
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  function wrapArticleContent(title: string, body:string, imagesrc:string) {
    return `<p style="text-align: center;"><span style="font-family: ${styles.paragraph['font-family']}; color: ${styles.paragraph.color}; font-size: ${styles.paragraph['font-size']};"><strong>${title}</strong></span></p><p><img style="display: block; margin-left: auto; margin-right: auto;" src=${imagesrc} alt=${title} width="100%" /></p><p><span style="text-align:center; "font-family: ${styles.paragraph['font-family']}; color: ${styles.paragraph.color}; font-size: ${styles.paragraph['font-size']};">${body}</span></p><p></p>`
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
    color: {
      dark: 'rgb(52, 73, 94)',
      light: 'rgb(149, 165, 166)'
    },
    'font-size': '12pt',
    'font-family': 'arial, helvetica, sans-serif'
  }
}