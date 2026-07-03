package com.bookverse.api.controller;

import com.bookverse.api.model.Book;
import com.bookverse.api.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Spring REST Controller exposing HTTP API Endpoints for Front-End integration.
 * This class serves as the API endpoint gateway corresponding to communication path "1" and "3"
 * in the architecture flowchart.
 */
@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*") // Allows communication with the Vite/React dev server
public class BookController {

    private final BookService bookService;

    @Autowired
    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    // =========================================================================
    // EXTERNAL GOOGLE BOOKS ENDPOINTS
    // =========================================================================

    /**
     * Endpoint to search books globally on Google Books.
     * GET /api/books/search?q={query}&maxResults={maxResults}
     */
    @GetMapping("/search")
    public ResponseEntity<String> searchExternalBooks(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int maxResults) {
        try {
            String jsonResponse = bookService.searchExternalBooks(q, maxResults);
            return ResponseEntity.ok(jsonResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Failed to connect to Google Books API: " + e.getMessage() + "\"}");
        }
    }

    /**
     * Endpoint to retrieve volume details for a specific book on Google Books.
     * GET /api/books/external/{googleBooksId}
     */
    @GetMapping("/external/{googleBooksId}")
    public ResponseEntity<String> getExternalBookDetails(@PathVariable String googleBooksId) {
        try {
            String jsonResponse = bookService.getExternalBookDetails(googleBooksId);
            return ResponseEntity.ok(jsonResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"error\": \"Book details not found on Google Books API.\"}");
        }
    }

    // =========================================================================
    // LOCAL USER LIBRARY ENDPOINTS (SQLite/H2/PostgreSQL state)
    // =========================================================================

    /**
     * Retrieve all books saved in user's local database.
     * GET /api/books
     */
    @GetMapping
    public ResponseEntity<List<Book>> getAllSavedBooks(
            @RequestParam(required = false) String status) {
        if (status != null && !status.isEmpty()) {
            return ResponseEntity.ok(bookService.getBooksByStatus(status));
        }
        return ResponseEntity.ok(bookService.getAllSavedBooks());
    }

    /**
     * Retrieve a locally saved book by its Google Books ID (useful to check library status).
     * GET /api/books/check/{googleId}
     */
    @GetMapping("/check/{googleId}")
    public ResponseEntity<Book> checkLocalBookByGoogleId(@PathVariable String googleId) {
        return bookService.findLocalBookByGoogleId(googleId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    /**
     * Save a new book or update status (e.g. Add to Library or Add to Wishlist).
     * POST /api/books
     */
    @PostMapping
    public ResponseEntity<Book> saveOrUpdateBook(@RequestBody Book book) {
        Book savedBook = bookService.saveOrUpdateBook(book);
        return new ResponseEntity<>(savedBook, HttpStatus.CREATED);
    }

    /**
     * Delete a book from user's personal collection.
     * DELETE /api/books/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteBook(@PathVariable Long id) {
        try {
            bookService.deleteBookFromLibrary(id);
            return ResponseEntity.ok(Map.of("message", "Book successfully removed from library."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Book not found with id: " + id));
        }
    }

    /**
     * Update progress/reviews/ratings for a saved book.
     * PATCH /api/books/{id}/progress
     */
    @PatchMapping("/{id}/progress")
    public ResponseEntity<Book> updateProgress(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {
        try {
            Integer currentPage = (Integer) updates.get("currentPage");
            String review = (String) updates.get("review");
            Integer rating = (Integer) updates.get("rating");
            String status = (String) updates.get("readingStatus");

            Book updatedBook = bookService.updateReadingProgress(id, currentPage, review, rating, status);
            return ResponseEntity.ok(updatedBook);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // =========================================================================
    // METRICS / DASHBOARD ANALYTICS ENDPOINTS
    // =========================================================================

    /**
     * Get aggregate profile dashboard statistics.
     * GET /api/books/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getProfileStats() {
        Long totalPages = bookService.getTotalPagesRead();
        List<Book> allBooks = bookService.getAllSavedBooks();
        
        long wishlistCount = allBooks.stream().filter(b -> "WISHLIST".equals(b.getReadingStatus())).count();
        long readingCount = allBooks.stream().filter(b -> "READING".equals(b.getReadingStatus())).count();
        long completedCount = allBooks.stream().filter(b -> "COMPLETED".equals(b.getReadingStatus())).count();

        Map<String, Object> stats = Map.of(
            "totalPagesRead", totalPages,
            "totalBooksInLibrary", allBooks.size(),
            "wishlistCount", wishlistCount,
            "readingCount", readingCount,
            "completedCount", completedCount
        );

        return ResponseEntity.ok(stats);
    }
}
