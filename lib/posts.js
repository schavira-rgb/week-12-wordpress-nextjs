import { remark } from 'remark';
import html from 'remark-html';
import matter from 'gray-matter';
import got from 'got';

// WordPress REST API URL - REPLACE WITH YOUR SITE URL!
const dataURL = "https://dev-wp-sql-assignment.pantheonsite.io/wp-json/twentytwentyfive-child/v1/latest-posts/1";

export async function getSortedPostsData() {
  let jsonString;
  
  try {
    // Fetch data from WordPress API
    jsonString = await got(dataURL);
    console.log('Fetched from WordPress:', jsonString.body);
  } catch(error) {
    console.error('Error fetching from WordPress:', error);
    return [];
  }

  // Parse the JSON response
  const jsonObj = JSON.parse(jsonString.body);
  
  // Map WordPress post fields to our expected format
  return jsonObj.map(post => {
    return {
      id: post.ID.toString(),           // WordPress uses 'ID' (uppercase)
      title: post.post_title,            // WordPress uses 'post_title'
      date: post.post_date.split(' ')[0] // WordPress uses 'post_date', take just the date part
    };
  }).sort((a, b) => {
    // Sort by date (newest first)
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getAllPostIds() {
  let jsonString;
  
  try {
    // Fetch data from WordPress API
    jsonString = await got(dataURL);
  } catch(error) {
    console.error('Error fetching from WordPress:', error);
    return [];
  }

  // Parse the JSON response
  const jsonObj = JSON.parse(jsonString.body);
  
  // Return array of post IDs for static generation
  return jsonObj.map(post => {
    return {
      params: {
        id: post.ID.toString()  // WordPress uses 'ID' (uppercase)
      }
    };
  });
}

export async function getPostData(id) {
  let jsonString;
  
  try {
    // Fetch data from WordPress API
    jsonString = await got(dataURL);
  } catch(error) {
    console.error('Error fetching from WordPress:', error);
    return null;
  }

  // Parse the JSON response
  const jsonObj = JSON.parse(jsonString.body);
  
  // Find the specific post by ID
  const post = jsonObj.find(p => p.ID.toString() === id);
  
  if (!post) {
    return null;
  }

  // Convert WordPress post_content to HTML using remark
  const processedContent = await remark()
    .use(html)
    .process(post.post_content);
  const contentHtml = processedContent.toString();

  // Return formatted post data
  return {
    id: post.ID.toString(),
    title: post.post_title,
    date: post.post_date.split(' ')[0],
    contentHtml
  };
}