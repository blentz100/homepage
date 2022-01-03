import { Feed } from "feed";
import { getAllNotes } from "./parse-notes";
import * as config from "./config";

export const buildFeed = () => {
  const feed = new Feed({
    id: `${config.baseUrl}/`,
    link: `${config.baseUrl}/`,
    title: config.siteName,
    description: config.longDescription,
    copyright: "https://creativecommons.org/licenses/by/4.0/",
    updated: new Date(),
    image: `${config.baseUrl}/static/images/me.jpg`,
    feedLinks: {
      rss: `${config.baseUrl}/feed.xml`,
      atom: `${config.baseUrl}/feed.atom`,
    },
    author: {
      name: config.authorName,
      link: config.baseUrl,
      email: "jake@jarv.is",
    },
  });

  const notes = getAllNotes();
  notes.forEach((note: any) => {
    feed.addItem({
      title: note.title,
      link: `${config.baseUrl}/notes/${note.slug}/`,
      guid: `${config.baseUrl}/notes/${note.slug}/`,
      description: note.description,
      image: note.image ? `${config.baseUrl}${note.image}` : "",
      author: [
        {
          name: config.authorName,
          link: config.baseUrl,
        },
      ],
      date: new Date(note.date),
    });
  });

  return feed;
};
