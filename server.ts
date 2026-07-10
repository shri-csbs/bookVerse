import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
let aiClient: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API Client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini Client:", err);
  }
} else {
  console.warn("GEMINI_API_KEY is not defined. Dynamic AI Recommendations will run in sandbox mode.");
}

// =========================================================================
// FALLBACK DETAILED BOOK DATABASE
// =========================================================================

// High-fidelity fallback book database to recover from external API rate-limiting or downtime.
// Contains curated books across Science Fiction, Technology, Fiction, Self-Help, Biography, Mystery, and History.
const MOCK_BOOKS = [
  {
    id: "yE6_EAAAQBAJ", // Project Hail Mary Google ID
    volumeInfo: {
      title: "Project Hail Mary",
      subtitle: "A Novel",
      authors: ["Andy Weir"],
      publisher: "Ballantine Books",
      publishedDate: "2021-05-04",
      description: "Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish. Except that right now, he doesn't even know his own name, let alone the nature of his assignment or how to complete it. All he knows is that he's been asleep for a very, very long time. And he's just been awakened to find himself millions of miles from home, with two corpses for company.",
      pageCount: 476,
      categories: ["Science Fiction"],
      averageRating: 4.7,
      ratingsCount: 12000,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "4H3GDwAAQBAJ", // Dune Google ID
    volumeInfo: {
      title: "Dune",
      subtitle: "The Epic Masterpiece",
      authors: ["Frank Herbert"],
      publisher: "Chilton Books",
      publishedDate: "1965-08-01",
      description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, who would become the mysterious man known as Muad'Dib. It is a brilliant blend of adventure and mysticism, environmentalism and politics.",
      pageCount: 688,
      categories: ["Science Fiction"],
      averageRating: 4.5,
      ratingsCount: 25000,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "_i6bDeoCQY0C", // Clean Code Google ID
    volumeInfo: {
      title: "Clean Code",
      subtitle: "A Handbook of Agile Software Craftsmanship",
      authors: ["Robert C. Martin"],
      publisher: "Prentice Hall",
      publishedDate: "2008-08-01",
      description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. But it doesn't have to be that way.",
      pageCount: 464,
      categories: ["Technology"],
      averageRating: 4.4,
      ratingsCount: 3500,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "mock_midnight_library",
    volumeInfo: {
      title: "The Midnight Library",
      subtitle: "A Novel",
      authors: ["Matt Haig"],
      publisher: "Viking",
      publishedDate: "2020-09-29",
      description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices.",
      pageCount: 304,
      categories: ["Fiction"],
      averageRating: 4.2,
      ratingsCount: 8400,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "mock_atomic_habits",
    volumeInfo: {
      title: "Atomic Habits",
      subtitle: "An Easy & Proven Way to Build Good Habits & Break Bad Ones",
      authors: ["James Clear"],
      publisher: "Avery",
      publishedDate: "2018-10-16",
      description: "No matter your goals, Atomic Habits offers a proven framework for improving—every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
      pageCount: 320,
      categories: ["Self-Help"],
      averageRating: 4.8,
      ratingsCount: 45000,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "mock_educated",
    volumeInfo: {
      title: "Educated",
      subtitle: "A Memoir",
      authors: ["Tara Westover"],
      publisher: "Random House",
      publishedDate: "2018-02-20",
      description: "An unforgettable memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.",
      pageCount: 352,
      categories: ["Biography"],
      averageRating: 4.6,
      ratingsCount: 19000,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "mock_steve_jobs",
    volumeInfo: {
      title: "Steve Jobs",
      subtitle: "The Biography",
      authors: ["Walter Isaacson"],
      publisher: "Simon & Schuster",
      publishedDate: "2011-10-24",
      description: "Based on more than forty interviews with Jobs conducted over two years—as well as interviews with more than a hundred family members, friends, adversaries, competitors, and colleagues—Walter Isaacson has written a riveting story of the roller-coaster life and searingly intense personality of a creative entrepreneur whose passion for perfection and ferocious drive revolutionized six industries.",
      pageCount: 656,
      categories: ["Biography"],
      averageRating: 4.3,
      ratingsCount: 9200,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "mock_silent_patient",
    volumeInfo: {
      title: "The Silent Patient",
      subtitle: "A Psychological Thriller",
      authors: ["Alex Michaelides"],
      publisher: "Celadon Books",
      publishedDate: "2019-02-05",
      description: "Alicia Berenson's life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house with big windows overlooking a park in one of London's most desirable areas. One evening her husband Gabriel returns home late from a fashion shoot, and Alicia shoots him five times in the face, and then never speaks another word.",
      pageCount: 336,
      categories: ["Mystery"],
      averageRating: 4.1,
      ratingsCount: 14000,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "mock_sapiens",
    volumeInfo: {
      title: "Sapiens",
      subtitle: "A Brief History of Humankind",
      authors: ["Yuval Noah Harari"],
      publisher: "Harper",
      publishedDate: "2015-02-10",
      description: "100,000 years ago, at least six human species inhabited the earth. Today there is just one. Us. Homo sapiens. How did our species succeed in the battle for dominance? How did our harvesting and foraging ancestors come together to design cities and kingdoms?",
      pageCount: 512,
      categories: ["History"],
      averageRating: 4.5,
      ratingsCount: 22000,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "mock_hobbit",
    volumeInfo: {
      title: "The Hobbit",
      subtitle: "There and Back Again",
      authors: ["J.R.R. Tolkien"],
      publisher: "George Allen & Unwin",
      publishedDate: "1937-09-21",
      description: "Written for J.R.R. Tolkien's own children, The Hobbit met with instant critical acclaim when it was published in 1937. It is a story of adventure, fantasy, and magical items, featuring Bilbo Baggins.",
      pageCount: 310,
      categories: ["Science Fiction"],
      averageRating: 4.7,
      ratingsCount: 30000,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "mock_ai_modern_approach",
    volumeInfo: {
      title: "Artificial Intelligence: A Modern Approach",
      subtitle: "Global Edition",
      authors: ["Stuart Russell", "Peter Norvig"],
      publisher: "Pearson",
      publishedDate: "2020-04-28",
      description: "The long-anticipated revision of this industry-standard guide to Artificial Intelligence, detailing the theories, concepts, and modern achievements in machine learning and deep learning architectures.",
      pageCount: 1136,
      categories: ["Artificial Intelligence"],
      averageRating: 4.6,
      ratingsCount: 1500,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "mock_life_three_zero",
    volumeInfo: {
      title: "Life 3.0",
      subtitle: "Being Human in the Age of Artificial Intelligence",
      authors: ["Max Tegmark"],
      publisher: "Knopf",
      publishedDate: "2017-08-29",
      description: "How will Artificial Intelligence affect crime, war, justice, jobs, society and our very sense of being human? Max Tegmark, an MIT professor, takes us into the heart of thinking about our AI future.",
      pageCount: 384,
      categories: ["Artificial Intelligence"],
      averageRating: 4.4,
      ratingsCount: 2800,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "mock_superintelligence",
    volumeInfo: {
      title: "Superintelligence",
      subtitle: "Paths, Dangers, Strategies",
      authors: ["Nick Bostrom"],
      publisher: "Oxford University Press",
      publishedDate: "2014-07-03",
      description: "Superintelligence asks the questions: What happens when machines surpass humans in general intelligence? Will artificial agents save or destroy us? Nick Bostrom lays the foundation for understanding the future of humanity and intelligent life.",
      pageCount: 352,
      categories: ["Artificial Intelligence"],
      averageRating: 4.1,
      ratingsCount: 3400,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "mock_alignment_problem",
    volumeInfo: {
      title: "The Alignment Problem",
      subtitle: "Machine Learning and Human Values",
      authors: ["Brian Christian"],
      publisher: "W. W. Norton & Company",
      publishedDate: "2020-10-06",
      description: "An unforgettable narrative of the rise of machine learning, revealing how algorithms can reinforce human bias and how researchers are working to align AI systems with human values.",
      pageCount: 496,
      categories: ["Artificial Intelligence"],
      averageRating: 4.5,
      ratingsCount: 1200,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "mock_mockingbird",
    volumeInfo: {
      title: "To Kill a Mockingbird",
      subtitle: "60th Anniversary Edition",
      authors: ["Harper Lee"],
      publisher: "J. B. Lippincott & Co.",
      publishedDate: "1960-07-11",
      description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it. To Kill a Mockingbird became both an instant bestseller and a critical success.",
      pageCount: 281,
      categories: ["Fiction"],
      averageRating: 4.8,
      ratingsCount: 40000,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "mock_gatsby",
    volumeInfo: {
      title: "The Great Gatsby",
      subtitle: "The Deluxe Classic",
      authors: ["F. Scott Fitzgerald"],
      publisher: "Charles Scribner's Sons",
      publishedDate: "1925-04-10",
      description: "The novel is set in the Jazz Age on Long Island, near New York City, and depicts first-person narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby.",
      pageCount: 180,
      categories: ["Fiction"],
      averageRating: 4.3,
      ratingsCount: 18000,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "mock_becoming",
    volumeInfo: {
      title: "Becoming",
      subtitle: "An Inspiring Memoir",
      authors: ["Michelle Obama"],
      publisher: "Crown Publishing Group",
      publishedDate: "2018-11-13",
      description: "An intimate, powerful, and inspiring memoir by the former First Lady of the United States. Michelle Obama invites readers into her world, chronicling the experiences that have shaped her.",
      pageCount: 448,
      categories: ["Biography"],
      averageRating: 4.7,
      ratingsCount: 21000,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "mock_davinci_code",
    volumeInfo: {
      title: "The Da Vinci Code",
      subtitle: "A Robert Langdon Novel",
      authors: ["Dan Brown"],
      publisher: "Doubleday",
      publishedDate: "2003-03-18",
      description: "A thriller that follows symbologist Robert Langdon and cryptologist Sophie Neveu after a murder in the Louvre Museum in Paris, as they become involved in a battle between the Priory of Sion and Opus Dei.",
      pageCount: 454,
      categories: ["Mystery"],
      averageRating: 4.0,
      ratingsCount: 24000,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "mock_guns_germs_steel",
    volumeInfo: {
      title: "Guns, Germs, and Steel",
      subtitle: "The Fates of Human Societies",
      authors: ["Jared Diamond"],
      publisher: "W. W. Norton & Company",
      publishedDate: "1997-03-01",
      description: "Jared Diamond convincingly argues that geographical and environmental factors shaped the modern world, explaining why some societies succeeded while others failed.",
      pageCount: 480,
      categories: ["History"],
      averageRating: 4.4,
      ratingsCount: 8900,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "mock_deep_work",
    volumeInfo: {
      title: "Deep Work",
      subtitle: "Rules for Focused Success in a Distracted World",
      authors: ["Cal Newport"],
      publisher: "Grand Central Publishing",
      publishedDate: "2016-01-05",
      description: "One of the most valuable skills in our economy is becoming increasingly rare. If you master this skill, you'll achieve extraordinary results. Deep work is the ability to focus without distraction on a cognitively demanding task.",
      pageCount: 304,
      categories: ["Self-Help"],
      averageRating: 4.6,
      ratingsCount: 12000,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "mock_monk_ferrari",
    volumeInfo: {
      title: "The Monk Who Sold His Ferrari",
      subtitle: "A Fable About Fulfilling Your Dreams & Reaching Your Destiny",
      authors: ["Robin Sharma"],
      publisher: "HarperOne",
      publishedDate: "1997-04-15",
      description: "A wonderfully crafted fable that tells the story of Julian Mantle, a superstar lawyer whose out-of-balance life leads to a near-fatal heart attack in a packed courtroom. His collapse brings on a spiritual crisis that forces him to seek answers to life's most important questions. Hoping to find happiness and fulfillment, he embarks on an extraordinary odyssey to an ancient culture where he meets the Sages of Sivana, who teach him a powerful system to release the potential of his mind, body, and soul.",
      pageCount: 224,
      categories: ["Self-Help"],
      averageRating: 4.6,
      ratingsCount: 35000,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1544911405-44259b1284d7?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1544911405-44259b1284d7?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "mock_5am_club",
    volumeInfo: {
      title: "The 5 AM Club",
      subtitle: "Own Your Morning. Elevate Your Life.",
      authors: ["Robin Sharma"],
      publisher: "HarperCollins",
      publishedDate: "2018-12-04",
      description: "Legendary leadership and elite performance expert Robin Sharma introduced The 5am Club concept over twenty years ago, based on a revolutionary morning routine that has helped his clients maximize their productivity, activate their best health and bulletproof their serenity in this age of overwhelming complexity.",
      pageCount: 336,
      categories: ["Self-Help"],
      averageRating: 4.5,
      ratingsCount: 28000,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "mock_who_will_cry",
    volumeInfo: {
      title: "Who Will Cry When You Die?",
      subtitle: "Life Lessons from the Monk Who Sold His Ferrari",
      authors: ["Robin Sharma"],
      publisher: "HarperCollins",
      publishedDate: "1999-06-15",
      description: "Do you feel that life is slipping by so fast that you might never get the chance to live with the meaning, happiness and joy you know you deserve? If so, this very special book by leadership guru Robin Sharma will guide you to a life that matters.",
      pageCount: 240,
      categories: ["Self-Help"],
      averageRating: 4.4,
      ratingsCount: 15000,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  },
  {
    id: "mock_leader_no_title",
    volumeInfo: {
      title: "The Leader Who Had No Title",
      subtitle: "A Modern Fable on Real Success in Business and in Life",
      authors: ["Robin Sharma"],
      publisher: "Simon & Schuster",
      publishedDate: "2010-03-09",
      description: "Robin Sharma has been sharing his leadership formula with Fortune 500 companies and trailblazers for years. For the first time, Sharma makes his proprietary process available to you, so that you can operate at your absolute best and help your organization thrive in these wild times.",
      pageCount: 224,
      categories: ["Self-Help"],
      averageRating: 4.3,
      ratingsCount: 12000,
      imageLinks: {
        smallThumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=300&auto=format&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=300&auto=format&fit=crop"
      },
      language: "en"
    }
  }
];

// Store dynamically generated books via Gemini so they can be retrieved by details endpoint
const DYNAMIC_BOOKS_MAP = new Map<string, any>();

// In-memory search cache to prevent hitting API quotas or rate limits on typing and repeated searches
const SEARCH_CACHE = new Map<string, { items: any[]; isFallback: boolean; fallbackReason?: string }>();

async function generateBooksWithAI(query: string): Promise<any[]> {
  if (!aiClient) return [];
  
  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Search query: "${query}"
Please generate a list of 5 to 8 real or highly realistic books matching this search query. Return the results as a JSON array where each item matches the Google Books Volume schema.
Make sure to include realistic categories, descriptions, published dates, ratings, and authors.
Return ONLY the JSON array conforming to this schema. Do not wrap in markdown or any other text.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              volumeInfo: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  authors: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  publisher: { type: Type.STRING },
                  publishedDate: { type: Type.STRING },
                  description: { type: Type.STRING },
                  pageCount: { type: Type.INTEGER },
                  categories: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  averageRating: { type: Type.NUMBER },
                  ratingsCount: { type: Type.INTEGER },
                  imageLinks: {
                    type: Type.OBJECT,
                    properties: {
                      smallThumbnail: { type: Type.STRING },
                      thumbnail: { type: Type.STRING }
                    },
                    required: ["smallThumbnail", "thumbnail"]
                  },
                  language: { type: Type.STRING }
                },
                required: ["title", "authors", "description", "imageLinks"]
              }
            },
            required: ["id", "volumeInfo"]
          }
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      const unsplashImages = [
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=300&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=300&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=300&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=300&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=300&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1447069387593-a5de0862481e?q=80&w=300&auto=format&fit=crop"
      ];
      return parsed.map((item: any, idx: number) => {
        // Enforce fallback image links
        if (!item.volumeInfo.imageLinks || !item.volumeInfo.imageLinks.thumbnail || item.volumeInfo.imageLinks.thumbnail.includes("example.com")) {
          const img = unsplashImages[idx % unsplashImages.length];
          item.volumeInfo.imageLinks = {
            smallThumbnail: img,
            thumbnail: img
          };
        }
        // Save to cache
        DYNAMIC_BOOKS_MAP.set(item.id, item);
        return item;
      });
    }
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("limit")) {
      console.warn(`[Gemini Free Tier Quota Exceeded] ${errMsg}`);
    } else {
      console.warn(`[Gemini Generation Warning] ${errMsg}`);
    }
  }
  return [];
}

// Ensure every book has a secure HTTPS cover image or a beautiful Unsplash placeholder cover
function sanitizeBook(book: any) {
  if (!book || !book.volumeInfo) return book;

  // Make sure volumeInfo.imageLinks exists
  if (!book.volumeInfo.imageLinks) {
    book.volumeInfo.imageLinks = {};
  }

  let thumbnail = book.volumeInfo.imageLinks.thumbnail || book.volumeInfo.imageLinks.smallThumbnail;

  if (thumbnail && !thumbnail.includes("example.com")) {
    // 1. Force HTTPS
    if (thumbnail.startsWith("http://")) {
      thumbnail = thumbnail.replace("http://", "https://");
    }
    // 2. Remove edge=curl which sometimes distorts or breaks certain formats
    thumbnail = thumbnail.replace("&edge=curl", "");
    
    // Assign back
    book.volumeInfo.imageLinks.thumbnail = thumbnail;
    book.volumeInfo.imageLinks.smallThumbnail = thumbnail;
  } else {
    // Generate a beautiful, themed background cover from Unsplash deterministically based on title or ID
    const title = book.volumeInfo.title || "";
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash += title.charCodeAt(i);
    }
    
    const unsplashCovers = [
      "https://images.unsplash.com/photo-1544911405-44259b1284d7?q=80&w=300&auto=format&fit=crop", // Elegant dark textured cover
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=300&auto=format&fit=crop", // Golden yellow paper cover
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300&auto=format&fit=crop", // Mystic library book
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=300&auto=format&fit=crop", // Clean white book art
      "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=300&auto=format&fit=crop", // Classical wooden desk cover
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=300&auto=format&fit=crop", // Library shelves
      "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=300&auto=format&fit=crop", // Indigo gradient cover
      "https://images.unsplash.com/photo-1513001900722-370f803f498d?q=80&w=300&auto=format&fit=crop", // Ethereal clouds and pages
      "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?q=80&w=300&auto=format&fit=crop", // Warm morning wood journal
      "https://images.unsplash.com/photo-1495640388908-05fa85288e61?q=80&w=300&auto=format&fit=crop", // Bookshelf focus
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=300&auto=format&fit=crop", // Modern artistic splash
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=300&auto=format&fit=crop", // Close-up of library pages
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=300&auto=format&fit=crop", // Creative dark minimal cover
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=300&auto=format&fit=crop", // Law / deep reading texture
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=300&auto=format&fit=crop"  // Deep forest green minimal cover
    ];

    const chosen = unsplashCovers[hash % unsplashCovers.length];
    book.volumeInfo.imageLinks.thumbnail = chosen;
    book.volumeInfo.imageLinks.smallThumbnail = chosen;
  }

  return book;
}

// Map Open Library API response objects into our expected Google Books structure
function mapOpenLibraryDocToGoogleBook(doc: any): any {
  // Extract id from key: e.g. "/works/OL27479W" -> "OL27479W"
  let id = doc.key ? doc.key.split('/').pop() : "";
  if (!id) {
    id = doc.cover_edition_key || (doc.edition_key && doc.edition_key[0]) || Math.random().toString(36).substring(7);
  }

  // Cover image: Search doc can have cover_i, cover_edition_key, edition_key, isbn
  let coverUrl = "";
  if (doc.cover_i) {
    coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
  } else if (doc.cover_edition_key) {
    coverUrl = `https://covers.openlibrary.org/b/olid/${doc.cover_edition_key}-L.jpg`;
  } else if (doc.isbn && doc.isbn.length > 0) {
    coverUrl = `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg`;
  }

  let publishedDate = "";
  if (doc.first_publish_year) {
    publishedDate = String(doc.first_publish_year);
  } else if (doc.publish_date && doc.publish_date.length > 0) {
    publishedDate = doc.publish_date[0];
  }

  let categories = doc.subject || [];
  if (categories.length > 5) {
    categories = categories.slice(0, 5);
  }
  if (categories.length === 0) {
    categories = ["Literature"];
  }

  return {
    id: id,
    volumeInfo: {
      title: doc.title || "Untitled Book",
      subtitle: doc.subtitle || "",
      authors: doc.author_name || ["Unknown Author"],
      publisher: doc.publisher?.[0] || doc.publisher || "Unknown Publisher",
      publishedDate: publishedDate,
      description: doc.description || (doc.first_sentence ? (Array.isArray(doc.first_sentence) ? doc.first_sentence.join(" ") : doc.first_sentence) : "") || `Explore the rich contents of "${doc.title || "this book"}" by ${doc.author_name ? doc.author_name.join(", ") : "Unknown Author"}.`,
      pageCount: doc.number_of_pages_median || doc.number_of_pages || 250,
      categories: categories,
      averageRating: doc.ratings_average ? parseFloat(doc.ratings_average.toFixed(1)) : 4.2,
      ratingsCount: doc.ratings_count || 120,
      imageLinks: {
        smallThumbnail: coverUrl,
        thumbnail: coverUrl
      },
      language: doc.language?.[0] || "en",
      previewLink: doc.key ? `https://openlibrary.org${doc.key}` : "https://openlibrary.org"
    }
  };
}

// Helper to filter/search inside our high-fidelity local catalog
function searchMockBooks(query: string) {
  const queryLower = (query || "").toLowerCase().trim();
  
  // Default bestselling / general categories
  if (!queryLower || queryLower === "bestsellers" || queryLower === "popular" || queryLower === "bestselling") {
    return MOCK_BOOKS;
  }

  // Filter based on typical query terms
  const results = MOCK_BOOKS.filter(book => {
    const titleMatch = book.volumeInfo.title.toLowerCase().includes(queryLower);
    const subtitleMatch = book.volumeInfo.subtitle?.toLowerCase().includes(queryLower);
    const authorMatch = book.volumeInfo.authors?.some(author => author.toLowerCase().includes(queryLower));
    const categoryMatch = book.volumeInfo.categories?.some(cat => cat.toLowerCase().includes(queryLower));
    const descMatch = book.volumeInfo.description?.toLowerCase().includes(queryLower);
    
    return titleMatch || subtitleMatch || authorMatch || categoryMatch || descMatch;
  });

  // Loose word match fallback if nothing fits strictly
  if (results.length === 0) {
    const words = queryLower.split(/\s+/).filter(w => w.length > 2);
    if (words.length > 0) {
      return MOCK_BOOKS.filter(book => {
        return words.some(word => 
          book.volumeInfo.title.toLowerCase().includes(word) ||
          book.volumeInfo.authors?.some(author => author.toLowerCase().includes(word)) ||
          book.volumeInfo.categories?.some(cat => cat.toLowerCase().includes(word))
        );
      });
    }
  }

  return results;
}

// =========================================================================
// API ENDPOINTS
// =========================================================================

/**
 * Proxy route for Google Books search
 * GET /api/books/search?q={query}
 */
app.get("/api/books/search", async (req, res) => {
  const query = req.query.q as string;
  if (!query) {
    res.status(400).json({ error: "Query parameter 'q' is required" });
    return;
  }

  const trimmedQuery = query.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();

  // 1. Check in-memory search cache to prevent duplicate backend searches
  if (SEARCH_CACHE.has(normalizedQuery)) {
    console.log(`[Search Cache Hit] Returning cached result for query: "${trimmedQuery}"`);
    res.json(SEARCH_CACHE.get(normalizedQuery));
    return;
  }

  // 2. Skip external API queries for single or double-letter typing queries to save API rate-limiting
  if (trimmedQuery.length < 3 && normalizedQuery !== "ai") {
    console.log(`[Short Query Optimization] Bypassing APIs for "${trimmedQuery}". Returning local matches.`);
    const localItems = searchMockBooks(trimmedQuery);
    const sanitizedItems = (localItems || []).map(b => sanitizeBook(JSON.parse(JSON.stringify(b))));
    const responseData = { items: sanitizedItems, isFallback: true, fallbackReason: "Short query local fallback" };
    SEARCH_CACHE.set(normalizedQuery, responseData);
    res.json(responseData);
    return;
  }

  let items: any[] = [];
  let isFallback = false;
  let fallbackReason = "";

  // 3. Attempt Open Library Search API fetch
  try {
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(trimmedQuery)}&limit=20`);
    if (response.ok) {
      const data = await response.json();
      if (data.docs && data.docs.length > 0) {
        items = data.docs.map((doc: any) => mapOpenLibraryDocToGoogleBook(doc));
      }
    } else {
      console.warn(`Open Library API responded with status ${response.status}`);
      fallbackReason = `Open Library API responded with status ${response.status}`;
    }
  } catch (error: any) {
    console.warn(`[Open Library Proxy Warning] Open Library search failed: ${error.message}`);
    fallbackReason = error.message;
  }

  // 4. If we got fewer than 3 items, try to generate relevant real-world books using Gemini!
  // Only try if Gemini client exists and the query is reasonably long (>= 4 chars) to avoid wasting quota on random fragments
  if (items.length < 3 && aiClient && trimmedQuery.length >= 4) {
    console.log(`Fewer than 3 items returned from Open Library for query '${trimmedQuery}'. Attempting Gemini AI search generation...`);
    try {
      const aiItems = await generateBooksWithAI(trimmedQuery);
      if (aiItems && aiItems.length > 0) {
        items = [...items, ...aiItems];
        isFallback = true;
      }
    } catch (aiErr: any) {
      console.warn(`[Gemini Generation Graceful Fallback] Failed or rate limited (429): ${aiErr.message}`);
    }
  }

  // 5. If we still have absolutely nothing, fall back to our high-fidelity curated local database
  if (items.length === 0) {
    console.log(`No items generated or fetched for query '${trimmedQuery}'. Providing curated high-fidelity mock results.`);
    items = searchMockBooks(trimmedQuery);
    isFallback = true;
  }

  // 6. Sanitize every book to use secure HTTPS links and beautiful Unsplash fallback covers
  const sanitizedItems = (items || []).map(b => sanitizeBook(JSON.parse(JSON.stringify(b))));

  const responseData = { items: sanitizedItems, isFallback, fallbackReason };
  
  // 7. Store the final result in the cache
  SEARCH_CACHE.set(normalizedQuery, responseData);

  res.json(responseData);
});

/**
 * Proxy route for specific book volume details
 * GET /api/books/details/:id
 */
app.get("/api/books/details/:id", async (req, res) => {
  const { id } = req.params;

  // Immediately prioritize local mock db if ID belongs to it or starts with "mock_"
  const localMatch = MOCK_BOOKS.find(b => b.id === id);
  if (localMatch) {
    res.json(sanitizeBook(JSON.parse(JSON.stringify(localMatch))));
    return;
  }

  // Check our dynamic registry of Gemini generated books
  const dynamicMatch = DYNAMIC_BOOKS_MAP.get(id);
  if (dynamicMatch) {
    res.json(sanitizeBook(JSON.parse(JSON.stringify(dynamicMatch))));
    return;
  }

  try {
    let bookItem: any = null;
    let description = "";

    // 1. Fetch metadata via search
    try {
      const searchResponse = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(id)}&limit=1`);
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.docs && searchData.docs.length > 0) {
          bookItem = mapOpenLibraryDocToGoogleBook(searchData.docs[0]);
        }
      }
    } catch (e: any) {
      console.warn(`[Open Library Details] Search metadata fetch failed: ${e.message}`);
    }

    // 2. Fetch description and fallback covers via works API
    try {
      const detailsResponse = await fetch(`https://openlibrary.org/works/${id}.json`);
      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json();
        if (detailsData.description) {
          if (typeof detailsData.description === 'string') {
            description = detailsData.description;
          } else if (detailsData.description.value) {
            description = detailsData.description.value;
          }
        }

        if (!bookItem) {
          let coverUrl = "";
          if (detailsData.covers && detailsData.covers.length > 0) {
            coverUrl = `https://covers.openlibrary.org/b/id/${detailsData.covers[0]}-L.jpg`;
          }
          bookItem = {
            id: id,
            volumeInfo: {
              title: detailsData.title || "Untitled Book",
              authors: ["Unknown Author"],
              publisher: "Unknown Publisher",
              publishedDate: detailsData.first_publish_date || "",
              description: description,
              pageCount: 250,
              categories: detailsData.subjects ? detailsData.subjects.slice(0, 5) : ["General"],
              averageRating: 4.2,
              ratingsCount: 120,
              imageLinks: {
                smallThumbnail: coverUrl,
                thumbnail: coverUrl
              },
              language: "en"
            }
          };
        }
      }
    } catch (e: any) {
      console.warn(`[Open Library Details] Works JSON fetch failed: ${e.message}`);
    }

    if (bookItem) {
      if (description) {
        bookItem.volumeInfo.description = description;
      }
      res.json(sanitizeBook(bookItem));
    } else {
      throw new Error(`Book details for ${id} could not be resolved from Open Library`);
    }
  } catch (error: any) {
    console.warn(`[Open Library Details Warning] Fallback triggered for ID: ${id}. Reason: ${error.message}`);
    
    // Check dynamic registry as a fallback in the catch block as well
    const backupDynamicMatch = DYNAMIC_BOOKS_MAP.get(id);
    if (backupDynamicMatch) {
      res.json(sanitizeBook(JSON.parse(JSON.stringify(backupDynamicMatch))));
      return;
    }

    // Graceful recovery: search inside our mock database for the closest id match
    const backupMatch = MOCK_BOOKS.find(b => b.id.toLowerCase() === id.toLowerCase() || b.volumeInfo.title.toLowerCase().includes(id.toLowerCase()));
    if (backupMatch) {
      res.json(sanitizeBook(JSON.parse(JSON.stringify(backupMatch))));
    } else {
      // Default placeholder if absolutely not found
      res.status(404).json({ error: "Book details could not be found or rate limit is active." });
    }
  }
});

/**
 * Hugging Face Summarization & Key Takeaways Proxy
 * POST /api/books/summarize-hf
 */
app.post("/api/books/summarize-hf", async (req, res) => {
  const { title, authors, description, categories } = req.body;

  if (!title || !description) {
    res.status(400).json({ error: "Title and description are required for summarization." });
    return;
  }

  const HF_KEY = process.env.HUGGINGFACE_API_KEY;
  const authorText = Array.isArray(authors) ? authors.join(", ") : authors || "Unknown Author";
  const categoryText = Array.isArray(categories) ? categories.join(", ") : categories || "Literature";

  // If live key exists, attempt to call Hugging Face model facebook/bart-large-cnn
  if (HF_KEY) {
    try {
      const cleanDesc = description.replace(/<[^>]*>/g, '').substring(0, 1024);
      const textToSummarize = `Book: ${title} by ${authorText}. Category: ${categoryText}. Synopsis: ${cleanDesc}`;

      const hfResponse = await fetch(
        "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
        {
          headers: { 
            Authorization: `Bearer ${HF_KEY}`,
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify({ inputs: textToSummarize }),
        }
      );

      if (hfResponse.ok) {
        const result = await hfResponse.json();
        if (Array.isArray(result) && result[0]?.summary_text) {
          res.json({
            isSandbox: false,
            summary: result[0].summary_text,
            takeaways: [
              "Hugging Face AI analyzed text structure.",
              "Extracted crucial plot points and stylistic context from publishing records.",
              "Processed via BART-large-cnn neural transformer architecture."
            ]
          });
          return;
        }
      } else {
        console.warn(`Hugging Face API returned error status ${hfResponse.status}. Falling back to sandbox generator.`);
      }
    } catch (err: any) {
      console.warn(`[Hugging Face API Warning] Failed to contact server: ${err.message}. Running fallback.`);
    }
  }

  // High-fidelity sandbox summary fallback if HF Key is missing or service experiences downtime
  const keyPoints = [
    `Explores the profound core themes of ${categoryText.toLowerCase()} in a highly engaging, thought-provoking narrative style.`,
    `Delves deeply into the motivations, internal conflicts, and emotional development of characters under professional or cosmic stress.`,
    `Written with unique stylistic prose that captures the intellectual spirit of ${authorText}'s previous literary publications.`
  ];

  // Tailored takeaway generation based on category/title
  if (categoryText.toLowerCase().includes("sci") || title.toLowerCase().includes("hail mary") || title.toLowerCase().includes("dune")) {
    keyPoints[0] = "Highlights the delicate relationship between scientific innovation, cosmic ecology, and civilization survival.";
    keyPoints[1] = "Examines the psychological strain of isolation, leadership responsibility, and survival in alien landscapes.";
    keyPoints[2] = "Features highly detailed world-building that balances speculative physics with deep sociological structures.";
  } else if (categoryText.toLowerCase().includes("tech") || categoryText.toLowerCase().includes("computer") || title.toLowerCase().includes("code")) {
    keyPoints[0] = "Focuses on clean software craftsmanship, architectural design principles, and technical debt reduction.";
    keyPoints[1] = "Provides actionable code management practices to improve legibility, scalability, and system performance.";
    keyPoints[2] = "Stresses the human-collaboration aspects of developing complex, maintainable industrial systems.";
  } else if (categoryText.toLowerCase().includes("self") || categoryText.toLowerCase().includes("habit")) {
    keyPoints[0] = "Lays out practical frameworks for cognitive reprogramming and tiny daily behavioral changes.";
    keyPoints[1] = "Emphasizes structural environment design over raw motivation or temporary willpower peaks.";
    keyPoints[2] = "Connects individual actions to broader identity shifts and long-term skill compounding.";
  }

  const mockSummary = `"${title}" is an extraordinary masterpiece of ${categoryText.toLowerCase()} authored by ${authorText}. It serves as a vital beacon in its field, examining critical human or physical boundaries. Through elegant structures and deep developmental sub-arcs, the writing successfully captivates reading explorers, leaving them with highly reflective intellectual takeaways.`;

  res.json({
    isSandbox: true,
    summary: mockSummary,
    takeaways: keyPoints
  });
});

/**
 * AI Search Insights and Curated Recommendations
 * POST /api/books/search-insights
 */
app.post("/api/books/search-insights", async (req, res) => {
  const { query } = req.body;
  if (!query) {
    res.status(400).json({ error: "Query parameter 'query' is required" });
    return;
  }

  const trimmedQuery = query.trim();
  const lowerQuery = trimmedQuery.toLowerCase();

  // 1. Sandbox fallback if Gemini client is not initialized
  if (!aiClient) {
    let topicSummary = `Explore the fascinating literature and thematic concepts surrounding "${trimmedQuery}". Books in this genre delve into the core human experiences, intellectual ideas, and narrative journeys of the subject.`;
    let recommendedBooks: any[] = [];

    if (lowerQuery.includes("habit") || lowerQuery.includes("self") || lowerQuery.includes("improve") || lowerQuery.includes("success") || lowerQuery.includes("productivity")) {
      topicSummary = "Self-improvement and habit design focus on human psychology, behavioral modification, and continuous self-optimization. These books offer actionable frameworks to bridge the gap between intent and daily execution.";
      recommendedBooks = [
        {
          id: "mock_atomic_habits",
          volumeInfo: {
            title: "Atomic Habits",
            subtitle: "An Easy & Proven Way to Build Good Habits & Break Bad Ones",
            authors: ["James Clear"],
            publisher: "Avery",
            publishedDate: "2018",
            description: "A highly practical framework to build good habits and break bad ones via tiny 1% daily changes.",
            pageCount: 320,
            categories: ["Self-Help"],
            averageRating: 4.8,
            ratingsCount: 45000,
            imageLinks: { thumbnail: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=300" }
          },
          recReason: "The absolute standard for understanding how tiny, identity-based habits compound into transformative lifestyle results."
        },
        {
          id: "mock_monk_ferrari",
          volumeInfo: {
            title: "The Monk Who Sold His Ferrari",
            subtitle: "A Fable About Fulfilling Your Dreams",
            authors: ["Robin Sharma"],
            publisher: "HarperOne",
            publishedDate: "1997",
            description: "A beautiful fable about a lawyer who undergoes a spiritual awakening in the Himalayas.",
            pageCount: 198,
            categories: ["Self-Help"],
            averageRating: 4.5,
            ratingsCount: 8900,
            imageLinks: { thumbnail: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300" }
          },
          recReason: "Offers beautiful spiritual insights on managing mind, body, and soul in a fast-paced modern world."
        }
      ];
    } else if (lowerQuery.includes("sci") || lowerQuery.includes("physics") || lowerQuery.includes("space") || lowerQuery.includes("cosmic") || lowerQuery.includes("future")) {
      topicSummary = "Science Fiction pushes the boundaries of speculative engineering, astrophysics, and sociology, exploring how humanity responds to space travel, technological breakthroughs, and alien environments.";
      recommendedBooks = [
        {
          id: "yE6_EAAAQBAJ",
          volumeInfo: {
            title: "Project Hail Mary",
            subtitle: "A Novel",
            authors: ["Andy Weir"],
            publisher: "Ballantine",
            publishedDate: "2021",
            description: "A lone astronaut wakes up on a starship with amnesia and must use spec-physics to save Earth from a solar disaster.",
            pageCount: 476,
            categories: ["Science Fiction"],
            averageRating: 4.7,
            ratingsCount: 12000,
            imageLinks: { thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=300" }
          },
          recReason: "A high-octane celebration of speculative physics, human problem solving, and unlikely cosmic friendships."
        },
        {
          id: "4H3GDwAAQBAJ",
          volumeInfo: {
            title: "Dune",
            subtitle: "The Epic Masterpiece",
            authors: ["Frank Herbert"],
            publisher: "Chilton",
            publishedDate: "1965",
            description: "The seminal masterpiece of political chess, spice trade, and ecological struggle on the desert planet Arrakis.",
            pageCount: 688,
            categories: ["Science Fiction"],
            averageRating: 4.5,
            ratingsCount: 25000,
            imageLinks: { thumbnail: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=300" }
          },
          recReason: "Unmatched in political depth, religious philosophy, and world-building of interstellar civilizations."
        }
      ];
    } else {
      recommendedBooks = [
        {
          id: "mock_midnight_library",
          volumeInfo: {
            title: "The Midnight Library",
            subtitle: "A Novel",
            authors: ["Matt Haig"],
            publisher: "Viking",
            publishedDate: "2020",
            description: "Between life and death is a library where shelves go on forever, allowing you to try every life you could have lived.",
            pageCount: 304,
            categories: ["Fiction"],
            averageRating: 4.2,
            ratingsCount: 8400,
            imageLinks: { thumbnail: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=300" }
          },
          recReason: "A touching and extremely comforting exploration of life choices, regrets, and finding meaning in our current reality."
        },
        {
          id: "mock_atomic_habits",
          volumeInfo: {
            title: "Atomic Habits",
            subtitle: "An Easy & Proven Way to Build Good Habits & Break Bad Ones",
            authors: ["James Clear"],
            publisher: "Avery",
            publishedDate: "2018",
            description: "James Clear's masterwork on creating positive habit structures and compound improvement.",
            pageCount: 320,
            categories: ["Self-Help"],
            averageRating: 4.8,
            ratingsCount: 45000,
            imageLinks: { thumbnail: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=300" }
          },
          recReason: "Highly recommended for practical self-structuring and daily routine management across all reading styles."
        }
      ];
    }

    const sanitizedBooks = recommendedBooks.map(b => {
      const sanitized = sanitizeBook(b);
      DYNAMIC_BOOKS_MAP.set(sanitized.id, sanitized);
      return {
        ...sanitized,
        recReason: b.recReason
      };
    });

    res.json({
      isSandbox: true,
      topicSummary,
      recommendedBooks: sanitizedBooks
    });
    return;
  }

  // 2. Real Gemini API generation
  try {
    const prompt = `Search Topic: "${trimmedQuery}"
Please analyze this search query, provide a clear, inspiring 2-3 sentence overview/summary of the topic's value to a reader, and recommend exactly 3 highly relevant real books on this topic.
For each book, return:
1. id (generate a unique, clean ID string e.g. "ai_rec_habits_atomic" or use standard library IDs if known).
2. volumeInfo conforming to the standard book schema (title, subtitle, authors, publisher, publishedDate, description, pageCount, categories, averageRating, ratingsCount, imageLinks with thumbnail, language).
3. recReason: A short, compelling explanation of why this specific book is recommended for this search topic.

Return the results ONLY as a JSON object with this exact structure:
{
  "topicSummary": "Your 2-3 sentence overview",
  "recommendedBooks": [
    {
      "id": "unique_id_string",
      "volumeInfo": {
        "title": "...",
        "subtitle": "...",
        "authors": ["..."],
        "publisher": "...",
        "publishedDate": "...",
        "description": "...",
        "pageCount": 123,
        "categories": ["..."],
        "averageRating": 4.5,
        "ratingsCount": 120,
        "imageLinks": {
          "smallThumbnail": "",
          "thumbnail": ""
        },
        "language": "en"
      },
      "recReason": "Compelling recommendation reason"
    }
  ]
}`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topicSummary: { type: Type.STRING },
            recommendedBooks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  recReason: { type: Type.STRING },
                  volumeInfo: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      subtitle: { type: Type.STRING },
                      authors: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      publisher: { type: Type.STRING },
                      publishedDate: { type: Type.STRING },
                      description: { type: Type.STRING },
                      pageCount: { type: Type.INTEGER },
                      categories: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      averageRating: { type: Type.NUMBER },
                      ratingsCount: { type: Type.INTEGER },
                      imageLinks: {
                        type: Type.OBJECT,
                        properties: {
                          smallThumbnail: { type: Type.STRING },
                          thumbnail: { type: Type.STRING }
                        },
                        required: ["smallThumbnail", "thumbnail"]
                      },
                      language: { type: Type.STRING }
                    },
                    required: ["title", "authors", "description", "imageLinks"]
                  }
                },
                required: ["id", "volumeInfo", "recReason"]
              }
            }
          },
          required: ["topicSummary", "recommendedBooks"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      const sanitizedBooks = data.recommendedBooks.map((b: any) => {
        const sanitized = sanitizeBook(b);
        DYNAMIC_BOOKS_MAP.set(sanitized.id, sanitized);
        return {
          ...sanitized,
          recReason: b.recReason
        };
      });

      res.json({
        isSandbox: false,
        topicSummary: data.topicSummary,
        recommendedBooks: sanitizedBooks
      });
    } else {
      throw new Error("No text returned from Gemini API");
    }
  } catch (error: any) {
    console.error("[Search Insights Route] Error generating AI search insights:", error);
    res.status(500).json({ error: "Failed to generate AI search recommendations: " + error.message });
  }
});

/**
 * AI Recommendation engine using Gemini 3.5 Flash
 * POST /api/books/recommend
 */
app.post("/api/books/recommend", async (req, res) => {
  const { savedBooks, prompt } = req.body;

  const librarySummary = Array.isArray(savedBooks) && savedBooks.length > 0
    ? savedBooks.map((b: any) => `- "${b.title}" by ${Array.isArray(b.authors) ? b.authors.join(", ") : b.authors} (Status: ${b.readingStatus}, Rating: ${b.rating}/5, Categories: ${b.categories?.join(", ")})`).join("\n")
    : "No books in library currently.";

  // Sandbox Mode: fallback recommendations if API Key is missing
  if (!aiClient) {
    res.json({
      isSandbox: true,
      text: `### 🚀 Welcome to Bookverse AI Recommendations!
      
**[Sandbox Mode Active]** Live Gemini recommendations are currently offline because the \`GEMINI_API_KEY\` is not set in your environment. 

To enable dynamic, highly customized recommendations, please add your Gemini key in **Settings > Secrets**.

Here are some curated general recommendations based on popular genres:

1. **Sci-Fi / Space Opera**: 
   - *Project Hail Mary* by Andy Weir - A lone astronaut must save Earth from an extinction-level event.
   - *Dune* by Frank Herbert - The sweeping epic of interstellar politics and ecology.

2. **Mystery & Suspense**:
   - *The Silent Patient* by Alex Michaelides - A shocking psychological thriller of a woman's act of violence.
   - *The Thursday Murder Club* by Richard Osman - Four septuagenarian friends meet weekly to solve cold cases.

3. **Fantasy / World-Building**:
   - *The Name of the Wind* by Patrick Rothfuss - The captivating story of Kvothe, a magically gifted musician and adventurer.
   - *Mistborn: The Final Empire* by Brandon Sanderson - A heist story set in a world of ash and metal-fueled magic.

*Your current Library has ${savedBooks?.length || 0} books. Once you link your API key, Gemini will scan these titles to produce deep, bespoke thematic recommendations tailored to your unique taste!*`
    });
    return;
  }

  try {
    let finalPrompt = "";
    if (prompt) {
      finalPrompt = `The user is asking: "${prompt}"\n\nTake into account their current personal book collection for context if helpful:\n${librarySummary}\n\nProvide 3 to 5 highly specific book recommendations matching their request. For each book, explain why they would love it based on their taste, keep descriptions concise, engaging and well-formatted in Markdown.`;
    } else {
      finalPrompt = `Analyze the user's current personal book collection and provide a personalized reading profile and 4 specific book recommendations that would be a perfect next read.\n\nUser's Library:\n${librarySummary}\n\nFormat your response beautifully with Markdown. Include sections like: \n- **Your Reading Archetype** (an analysis of their favorite themes/genres)\n- **Bespoke Recommendations** (each book with Title, Author, Genre, and "Why You'll Love It" relating back to their existing library)\n- **Reading Tip** (a fun, actionable habit or challenge for their reading goals)`;
    }

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: finalPrompt,
      config: {
        systemInstruction: "You are Bookverse AI, a brilliant, well-read literary assistant. You have absolute knowledge of all literature, genres, and reading habits. You provide beautiful, warm, structured book recommendations in neat Markdown. Avoid technical jargon or empty filler. Speak with style, warmth, and high literary taste."
      }
    });

    res.json({
      isSandbox: false,
      text: response.text || "No recommendations could be generated at this time."
    });
  } catch (error: any) {
    console.warn("[Recommendations Route] Gemini API encountered error. Generating beautiful offline fallback...", error);
    
    const errorMessage = error?.message || String(error);
    const isServiceUnavailable = errorMessage.includes("503") || errorMessage.includes("UNAVAILABLE") || errorMessage.includes("demand");
    const noticeHeader = isServiceUnavailable
      ? `> ⚠️ **Service Notice**: The live Gemini AI model is currently experiencing temporary high-demand spikes. To keep your experience seamless, our **Curated Cognitive Fallback Engine** has instantly analyzed your request and compiled these highly-rated literary matches.`
      : `> ⚠️ **Service Notice**: Live AI recommendation quotas have been exceeded for this session. Our **Curated Cognitive Fallback Engine** has instantly analyzed your request and compiled these highly-rated literary matches.`;

    let fallbackText = `### 🚀 Welcome to Bookverse AI Recommendations!

${noticeHeader}

`;

    if (prompt) {
      const pLower = prompt.toLowerCase();
      fallbackText += `#### 🔍 Curated Response for: *"${prompt}"*\n\n`;

      if (pLower.includes("habit") || pLower.includes("self") || pLower.includes("improve") || pLower.includes("personal") || pLower.includes("productivity") || pLower.includes("success") || pLower.includes("grow")) {
        fallbackText += `Based on your request, we recommend these powerful self-mastery books to elevate your habits and lifestyle:

1. **Atomic Habits** by *James Clear* (Genre: Self-Help)
   - **Why You'll Love It**: James Clear delivers an elegant, practical blueprint for tiny daily adjustments that lead to remarkable long-term compounding results. It is the gold standard of modern habit design.
2. **The Monk Who Sold His Ferrari** by *Robin Sharma* (Genre: Self-Help / Philosophy)
   - **Why You'll Love It**: A beautifully structured modern fable detailing Julian Mantle's spiritual awakening. It offers practical tools for unlocking mental potential and inner tranquility.
3. **The 5 AM Club** by *Robin Sharma* (Genre: Self-Help / Productivity)
   - **Why You'll Love It**: Introduces a revolutionary morning routine that helps individuals maximize productivity, build elite health, and protect peace of mind in our hyper-connected world.`;
      } else if (pLower.includes("sci") || pLower.includes("space") || pLower.includes("future") || pLower.includes("physics") || pLower.includes("alien") || pLower.includes("star") || pLower.includes("cosmic")) {
        fallbackText += `Here are our top space-faring and speculative science fiction masterpieces:

1. **Project Hail Mary** by *Andy Weir* (Genre: Science Fiction)
   - **Why You'll Love It**: A brilliant scientific thriller featuring a lone astronaut who must solve speculative physics problems on the fly to save Earth from a catastrophic solar extinction event.
2. **Dune** by *Frank Herbert* (Genre: Sci-Fi / Space Opera)
   - **Why You'll Love It**: The legendary masterpiece exploring the ecology, political chess games, and messianic prophecies of Arrakis, the desert planet.
3. **The Hobbit** by *J.R.R. Tolkien* (Genre: Fantasy / Adventure)
   - **Why You'll Love It**: While fantasy, its sheer scale of world-building matches the greatest sci-fi epics. A delightful story of Bilbo Baggins' unexpected expedition.`;
      } else if (pLower.includes("mystery") || pLower.includes("thriller") || pLower.includes("silent") || pLower.includes("crime") || pLower.includes("murder") || pLower.includes("suspense")) {
        fallbackText += `We have selected these highly rated psychological thrillers and crime investigations:

1. **The Silent Patient** by *Alex Michaelides* (Genre: Psychological Thriller)
   - **Why You'll Love It**: Alicia Berenson shoots her husband five times in the face and never speaks another word. This gripping, legendary mystery keeps you guessing until the absolute final page.
2. **The Thursday Murder Club** by *Richard Osman* (Genre: Mystery)
   - **Why You'll Love It**: In a peaceful retirement village, four unlikely septuagenarian friends meet weekly to investigate unsolved cold cases, finding themselves in the middle of a live investigation.`;
      } else if (pLower.includes("biography") || pLower.includes("life") || pLower.includes("real") || pLower.includes("memoir") || pLower.includes("history") || pLower.includes("sapiens") || pLower.includes("human")) {
        fallbackText += `Explore these exceptional memoirs, biographies, and historical analyses of our collective human journey:

1. **Sapiens: A Brief History of Humankind** by *Yuval Noah Harari* (Genre: History / Anthropology)
   - **Why You'll Love It**: This book details the major scientific, agricultural, and cognitive revolutions that allowed Homo sapiens to dominate the globe.
2. **Educated: A Memoir** by *Tara Westover* (Genre: Biography / Memoir)
   - **Why You'll Love It**: An unforgettable, deeply moving personal account of survival, self-invention, and the power of higher education to transform a life from rural isolation to a Cambridge PhD.
3. **Steve Jobs** by *Walter Isaacson* (Genre: Biography)
   - **Why You'll Love It**: A riveting, raw chronicle of the intense and creative entrepreneur whose sheer will and perfectionism revolutionized six global industries.`;
      } else {
        fallbackText += `We analyzed your prompt and matching genres. Here are some incredible, globally acclaimed titles you should explore next:

1. **The Midnight Library** by *Matt Haig* (Genre: Modern Fiction)
   - **Why You'll Love It**: A beautiful, reflective novel exploring the lives you could have lived if you made other choices. Ideal for readers seeking a touch of magic, philosophy, and mental wellness.
2. **Atomic Habits** by *James Clear* (Genre: Self-Help)
   - **Why You'll Love It**: Widely loved for its actionable ideas on human psychology, identity-based habits, and achieving mastery.
3. **The Silent Patient** by *Alex Michaelides* (Genre: Mystery)
   - **Why You'll Love It**: A superb puzzle of an investigation that explores deep trauma, psychological silence, and the complex human mind.`;
      }
    } else {
      const hasSelfHelp = Array.isArray(savedBooks) && savedBooks.some((b: any) => b.categories?.some((c: string) => c.toLowerCase().includes("self") || c.toLowerCase().includes("habit")));
      const hasSciFi = Array.isArray(savedBooks) && savedBooks.some((b: any) => b.categories?.some((c: string) => c.toLowerCase().includes("sci") || c.toLowerCase().includes("fiction")));
      const hasMystery = Array.isArray(savedBooks) && savedBooks.some((b: any) => b.categories?.some((c: string) => c.toLowerCase().includes("mystery") || c.toLowerCase().includes("thriller")));

      let archetype = "The Versatile Explorer";
      let descriptionStr = "You have an eclectic, high-taste reading profile that balances deep human interest narratives, classic structures, and modern practical ideas.";
      
      if (hasSelfHelp && hasSciFi) {
        archetype = "The Future-Focused Growth Catalyst";
        descriptionStr = "You possess a fascinating balance between strategic personal mastery and open-minded speculative imagination. You read to optimize your current reality while dreaming of vast horizons.";
      } else if (hasSelfHelp) {
        archetype = "The Continuous Self-Optimizer";
        descriptionStr = "You are highly focused on behavioral design, cognitive reprogramming, and elite productivity. You treat books as practical blueprints to optimize daily peace, focus, and strategic mastery.";
      } else if (hasSciFi) {
        archetype = "The Galactic Speculative Thinker";
        descriptionStr = "You love immersing yourself in expansive new landscapes, intricate scientific systems, and profound questions of cosmic sociology and human future paths.";
      } else if (hasMystery) {
        archetype = "The Analytical Puzzle Master";
        descriptionStr = "You have an outstanding appreciation for intricate plotlines, psychology, hidden human motives, and high-stakes detective games. You love solving complex narrative puzzles.";
      }

      fallbackText += `- **Your Reading Archetype**: **${archetype}**\n- *Profile Analysis*: ${descriptionStr}\n\n### 📚 Bespoke Recommendations For You:\n\n`;

      if (archetype.includes("Growth") || archetype.includes("Optimizer")) {
        fallbackText += `1. **The Monk Who Sold His Ferrari** by *Robin Sharma* (Genre: Self-Help)
   - **Why You'll Love It**: Perfect companion to your library. It delivers a wonderful fable-like introduction to mindfulness and habit optimization.
2. **The 5 AM Club** by *Robin Sharma* (Genre: Self-Help / Productivity)
   - **Why You'll Love It**: It will help you construct a pristine morning routine to implement the self-help philosophies you love.
3. **Steve Jobs** by *Walter Isaacson* (Genre: Biography)
   - **Why You'll Love It**: A fascinating real-world case study of a relentless visionary who applied extreme focus to shape our computing world.`;
      } else if (archetype.includes("Galactic") || archetype.includes("Speculative")) {
        fallbackText += `1. **Project Hail Mary** by *Andy Weir* (Genre: Science Fiction)
   - **Why You'll Love It**: Matches your love of deep science fiction. It is a highly fast-paced, optimistic story about scientific companionship and saving civilizations.
2. **Dune** by *Frank Herbert* (Genre: Space Opera / Sci-Fi)
   - **Why You'll Love It**: The foundational classic of world-building and cosmic politics. Essential reading for any speculative literature explorer.
3. **The Midnight Library** by *Matt Haig* (Genre: Modern Fiction)
   - **Why You'll Love It**: Blends a magical multiverse premise with deep psychological reflection on choice, regret, and finding joy.`;
      } else {
        fallbackText += `1. **The Silent Patient** by *Alex Michaelides* (Genre: Mystery / Thriller)
   - **Why You'll Love It**: A gripping, award-winning thriller detailing psychological silence and hidden family secrets. Highly recommended for fans of mystery.
2. **The Midnight Library** by *Matt Haig* (Genre: Fiction)
   - **Why You'll Love It**: A poignant exploration of parallel lifetimes and regret. An extremely comforting and engaging read.
3. **Atomic Habits** by *James Clear* (Genre: Self-Help)
   - **Why You'll Love It**: A highly accessible and transformative exploration of how minor daily behaviors shape our lifetime destiny.`;
      }

      fallbackText += `\n\n- **Reading Tip**: Try the **"15-Page Rule"** — commit to reading exactly 15 pages every morning with your favorite warm drink before looking at any digital screens. This small, protected window leads to over 15 finished books a year!`;
    }

    res.json({
      isSandbox: true,
      text: fallbackText
    });
  }
});

// =========================================================================
// VITE DEV SERVER / STATIC SERVING
// =========================================================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files server mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
