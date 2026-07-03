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
  }
];

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

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`);
    if (!response.ok) {
      throw new Error(`Google Books API responded with status ${response.status}`);
    }
    const data = await response.json();
    
    // If we got valid items, return them. Otherwise fallback to prevent blank result
    if (data.items && data.items.length > 0) {
      res.json(data);
    } else {
      console.log(`No items returned from Google Books for query '${query}'. Providing high-fidelity mock results.`);
      res.json({ items: searchMockBooks(query), isFallback: true });
    }
  } catch (error: any) {
    console.warn(`[Google Books Proxy Warning] Fallback triggered. Reason: ${error.message}`);
    // Graceful recovery from 429 Too Many Requests or network downtime
    res.json({
      items: searchMockBooks(query),
      isFallback: true,
      fallbackReason: error.message
    });
  }
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
    res.json(localMatch);
    return;
  }

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
    if (!response.ok) {
      throw new Error(`Google Books API responded with status ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.warn(`[Google Books Details Warning] Fallback triggered for ID: ${id}. Reason: ${error.message}`);
    
    // Graceful recovery: search inside our mock database for the closest id match
    const backupMatch = MOCK_BOOKS.find(b => b.id.toLowerCase() === id.toLowerCase() || b.volumeInfo.title.toLowerCase().includes(id.toLowerCase()));
    if (backupMatch) {
      res.json(backupMatch);
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
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "AI engine experienced a glitch. Please try again." });
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
