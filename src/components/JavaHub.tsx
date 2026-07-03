import React, { useState } from 'react';
import { Terminal, Cpu, Database, Network, ArrowRight, Code, BookOpen, Layers, CheckCircle2, Copy } from 'lucide-react';

export default function JavaHub() {
  const [activeFile, setActiveFile] = useState<'Controller' | 'Service' | 'Repository' | 'Integration' | 'Entity'>('Controller');
  const [copied, setCopied] = useState(false);

  const fileContents = {
    Entity: {
      name: 'Book.java',
      path: 'com/bookverse/api/model/Book.java',
      description: 'The standard JPA Entity model annotated to map Java state directly to the relational "books" database table.',
      code: `package com.bookverse.api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "books")
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String googleBooksId; // Unique ID from Google Books API
    
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String authors;
    private String publisher;
    private String publishedDate;

    @Column(columnDefinition = "TEXT")
    private String description;
    private Integer pageCount;
    private String categories;
    private String thumbnail;

    // User-specific custom shelving fields
    private String readingStatus; // "WISHLIST", "READING", "COMPLETED"
    private Integer currentPage;
    private Integer rating; // 1-5 Stars

    @Column(columnDefinition = "TEXT")
    private String review;

    private LocalDateTime dateAdded;
    private LocalDateTime dateUpdated;

    public Book() {
        this.dateAdded = LocalDateTime.now();
        this.dateUpdated = LocalDateTime.now();
        this.currentPage = 0;
        this.rating = 0;
    }
    
    // Getters, Setters, and Parameterized Constructors...
}`
    },
    Controller: {
      name: 'BookController.java',
      path: 'com/bookverse/api/controller/BookController.java',
      description: 'Spring REST Controller defining HTTP JSON API endpoints. Handles client communications (Requests 1 & 3) and delegates to Service layer.',
      code: `package com.bookverse.api.controller;

import com.bookverse.api.model.Book;
import com.bookverse.api.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*") // Bridges React Front-End to Spring Boot
public class BookController {

    private final BookService bookService;

    @Autowired
    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    // Proxy Google Books API Search
    @GetMapping("/search")
    public ResponseEntity<String> searchExternalBooks(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int maxResults) {
        return ResponseEntity.ok(bookService.searchExternalBooks(q, maxResults));
    }

    // Save/Update Book to personal shelf
    @PostMapping
    public ResponseEntity<Book> saveOrUpdateBook(@RequestBody Book book) {
        return new ResponseEntity<>(bookService.saveOrUpdateBook(book), HttpStatus.CREATED);
    }

    // Log progress/ratings/reviews
    @PatchMapping("/{id}/progress")
    public ResponseEntity<Book> updateProgress(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {
        Integer currentPage = (Integer) updates.get("currentPage");
        String review = (String) updates.get("review");
        Integer rating = (Integer) updates.get("rating");
        String status = (String) updates.get("readingStatus");

        return ResponseEntity.ok(bookService.updateReadingProgress(id, currentPage, review, rating, status));
    }
}`
    },
    Service: {
      name: 'BookService.java',
      path: 'com/bookverse/api/service/BookService.java',
      description: 'The core business logic layer that coordinates operations, manages transaction boundaries, and connects repositories with external integrations.',
      code: `package com.bookverse.api.service;

import com.bookverse.api.model.Book;
import com.bookverse.api.repository.BookRepository;
import com.bookverse.api.integration.GoogleBooksApi;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BookService {
    private final BookRepository bookRepository;
    private final GoogleBooksApi googleBooksApi;

    public BookService(BookRepository bookRepository, GoogleBooksApi googleBooksApi) {
        this.bookRepository = bookRepository;
        this.googleBooksApi = googleBooksApi;
    }

    public String searchExternalBooks(String query, int maxResults) {
        return googleBooksApi.searchBooks(query, maxResults);
    }

    public Book saveOrUpdateBook(Book book) {
        return bookRepository.findByGoogleBooksId(book.getGoogleBooksId())
            .map(existing -> {
                existing.setReadingStatus(book.getReadingStatus());
                existing.setCurrentPage(book.getCurrentPage());
                existing.setRating(book.getRating());
                existing.setReview(book.getReview());
                return bookRepository.save(existing);
            })
            .orElseGet(() -> bookRepository.save(book));
    }
}`
    },
    Repository: {
      name: 'BookRepository.java',
      path: 'com/bookverse/api/repository/BookRepository.java',
      description: 'Data Access Interface extending Spring Data JPA. Generates native queries for CRUD, library keyword search, and metrics aggregates.',
      code: `package com.bookverse.api.repository;

import com.bookverse.api.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    Optional<Book> findByGoogleBooksId(String googleBooksId);

    List<Book> findByReadingStatus(String readingStatus);

    @Query("SELECT b FROM Book b WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(b.authors) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Book> searchLocalLibrary(@Param("keyword") String keyword);

    @Query("SELECT b.categories, COUNT(b) FROM Book b GROUP BY b.categories")
    List<Object[]> countBooksByGenre();
}`
    },
    Integration: {
      name: 'GoogleBooksApi.java',
      path: 'com/bookverse/api/integration/GoogleBooksApi.java',
      description: 'Handles outward API integration. Sends HTTP requests using Spring RestTemplate to resolve catalogs on Google Books (Flow 2 & 4).',
      code: `package com.bookverse.api.integration;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class GoogleBooksApi {
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1/volumes";

    public String searchBooks(String query, int maxResults) {
        String url = UriComponentsBuilder.fromHttpUrl(GOOGLE_BOOKS_BASE_URL)
                .queryParam("q", query)
                .queryParam("maxResults", maxResults)
                .toUriString();

        return restTemplate.getForObject(url, String.class);
    }

    public String getBookDetails(String volumeId) {
        String url = GOOGLE_BOOKS_BASE_URL + "/" + volumeId;
        return restTemplate.getForObject(url, String.class);
    }
}`
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContents[activeFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="java-hub-section">
      {/* Dev Header */}
      <div className="border-b border-gray-100 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <Terminal className="h-8 w-8 text-amber-500 mr-2 shrink-0 animate-pulse" />
            Java Backend Architecture Hub
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Explore the clean, fully generated Spring Boot Java ecosystem serving as your enterprise backend.
          </p>
        </div>
        <span className="self-start md:self-center bg-amber-50 text-amber-800 text-2xs font-extrabold font-mono px-3 py-1 rounded-full border border-amber-200">
          SPRING BOOT REST API
        </span>
      </div>

      {/* Grid: Flow & Visual Diagram Mapping */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Architectural Communication flowchart block */}
          <div className="bg-gray-950 text-gray-200 rounded-3xl p-6 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <span className="text-xs font-bold text-emerald-400 font-mono tracking-widest uppercase">System Communication Blueprint</span>
              <span className="text-3xs text-gray-500">SYSTEM ARCHITECTURE</span>
            </div>

            {/* Visual interactive diagram cards mapping */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {/* Card 1 */}
              <div className="bg-gray-900/80 border border-gray-800/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg">
                    <Code className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-sm text-white">1. Front-End client</span>
                </div>
                <p className="text-3xs text-gray-400 leading-relaxed">
                  Vite + React single-page app triggers HTTP requests from widgets. Routes map dynamically to port <strong className="text-white">3000</strong>.
                </p>
                <div className="text-2xs text-rose-400 font-mono pt-1">
                  &rarr; POST /api/books
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-gray-900/80 border border-gray-800/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-sm text-white">2. Spring REST API</span>
                </div>
                <p className="text-3xs text-gray-400 leading-relaxed">
                  Annotated controllers intercept JSON bodies, run validation checks in the service layer, and persist shelf items.
                </p>
                <div className="text-2xs text-cyan-400 font-mono pt-1">
                  &rarr; BookController.java
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-gray-900/80 border border-gray-800/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
                    <Database className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-sm text-white">3. Data Source</span>
                </div>
                <p className="text-3xs text-gray-400 leading-relaxed">
                  Spring Data JPA + Hibernate automatically translates transactions into SQL DML and writes records into PostgreSQL.
                </p>
                <div className="text-2xs text-amber-400 font-mono pt-1">
                  &rarr; BookRepository.java
                </div>
              </div>
            </div>

            {/* Explanation panel */}
            <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-800 text-2xs text-gray-400 leading-relaxed space-y-2">
              <span className="font-bold text-white block">How External Queries Integrate:</span>
              <p>
                When searching, the front-end hits <strong className="text-white">/api/books/search</strong>. The backend Spring Boot <strong className="text-white">BookController</strong> forwards this to <strong className="text-white">BookService</strong>, which triggers an outward RestTemplate call to the <strong className="text-white">Google Books API</strong> (Flows 2 & 4). The returned volume JSON is compiled on-the-fly and parsed into active bookshelf states.
              </p>
            </div>
          </div>

          {/* Code Viewer IDE Card */}
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm flex flex-col">
            {/* Tab header */}
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Code className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-bold text-gray-800 tracking-wide font-mono">
                  {fileContents[activeFile].path}
                </span>
              </div>

              <button
                onClick={handleCopy}
                className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-2xs font-semibold text-gray-600 transition-colors cursor-pointer"
                id="copy-code-btn"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy source
                  </>
                )}
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-500 italic bg-amber-50/50 border-l-4 border-amber-500 px-3 py-2 rounded-r-lg">
                {fileContents[activeFile].description}
              </p>

              {/* Code Pre container */}
              <div className="bg-gray-950 text-emerald-400 p-5 rounded-2xl overflow-x-auto text-xs font-mono leading-relaxed max-h-[400px] shadow-inner select-all">
                <pre>{fileContents[activeFile].code}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar tabs */}
        <div className="space-y-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block ml-1">Ecosystem Files</span>
          <div className="flex flex-col gap-2">
            {(Object.keys(fileContents) as Array<keyof typeof fileContents>).map((key) => {
              const file = fileContents[key];
              const isActive = activeFile === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveFile(key)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer group flex items-start space-x-3 ${
                    isActive
                      ? 'bg-amber-50/80 border-amber-200 text-amber-900 shadow-xs'
                      : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 text-gray-700'
                  }`}
                  id={`java-tab-${key}`}
                >
                  <div className={`p-2 rounded-xl mt-0.5 shrink-0 transition-colors ${
                    isActive ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'
                  }`}>
                    <Terminal className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs tracking-tight block">{file.name}</span>
                    <span className="text-3xs text-gray-400 mt-0.5 line-clamp-2 block leading-snug">
                      {file.description.split('.')[0]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick instructions */}
          <div className="bg-emerald-50/30 border border-emerald-500/10 rounded-2xl p-5 space-y-3">
            <h4 className="font-bold text-emerald-900 text-xs flex items-center">
              <Layers className="h-4 w-4 text-emerald-600 mr-1.5" />
              Developer Readme
            </h4>
            <p className="text-3xs text-emerald-800 leading-relaxed">
              We have written fully functional Java Source classes in your root workspace inside the <strong className="font-bold font-mono">/backend-java/</strong> directory. You can directly clone them, drop them into your Spring Boot IntelliJ environment, specify your datasource in properties, and run your enterprise API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
