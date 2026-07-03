package com.bookverse.api.service;

import com.bookverse.api.model.Book;
import com.bookverse.api.repository.BookRepository;
import com.bookverse.api.integration.GoogleBooksApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service Layer class that implements the business logic for the Bookverse application.
 * Manages operations on the user's personal library, wishlist, and proxies calls
 * to the external Google Books API.
 */
@Service
@Transactional
public class BookService {

    private final BookRepository bookRepository;
    private final GoogleBooksApi googleBooksApi;

    @Autowired
    public BookService(BookRepository bookRepository, GoogleBooksApi googleBooksApi) {
        this.bookRepository = bookRepository;
        this.googleBooksApi = googleBooksApi;
    }

    // --- GOOGLE BOOKS PROXY LOGIC ---

    /**
     * Search books in external Google Books database.
     */
    public String searchExternalBooks(String query, int maxResults) {
        return googleBooksApi.searchBooks(query, maxResults);
    }

    /**
     * Retrieve book details from external Google Books database.
     */
    public String getExternalBookDetails(String googleBooksId) {
        return googleBooksApi.getBookDetails(googleBooksId);
    }

    // --- LOCAL LIBRARY & WISHLIST PERSISTENCE LOGIC ---

    /**
     * Fetch all books currently saved in the local database.
     */
    public List<Book> getAllSavedBooks() {
        return bookRepository.findAll();
    }

    /**
     * Fetch saved books matching a specific reading status ("WISHLIST", "READING", "COMPLETED").
     */
    public List<Book> getBooksByStatus(String status) {
        return bookRepository.findByReadingStatus(status.toUpperCase());
    }

    /**
     * Save a book to local library or wishlist.
     * If the book already exists, it updates the status.
     */
    public Book saveOrUpdateBook(Book book) {
        Optional<Book> existingBookOpt = bookRepository.findByGoogleBooksId(book.getGoogleBooksId());
        
        if (existingBookOpt.isPresent()) {
            Book existingBook = existingBookOpt.get();
            existingBook.setReadingStatus(book.getReadingStatus());
            if (book.getCurrentPage() != null) existingBook.setCurrentPage(book.getCurrentPage());
            if (book.getRating() != null) existingBook.setRating(book.getRating());
            if (book.getReview() != null) existingBook.setReview(book.getReview());
            return bookRepository.save(existingBook);
        } else {
            return bookRepository.save(book);
        }
    }

    /**
     * Find a locally saved book by its database ID.
     */
    public Optional<Book> findLocalBookById(Long id) {
        return bookRepository.findById(id);
    }

    /**
     * Find a locally saved book by its Google Books API ID.
     */
    public Optional<Book> findLocalBookByGoogleId(String googleId) {
        return bookRepository.findByGoogleBooksId(googleId);
    }

    /**
     * Delete a book from local library/wishlist.
     */
    public void deleteBookFromLibrary(Long id) {
        bookRepository.deleteById(id);
    }

    /**
     * Update reading progress for a book currently in progress.
     */
    public Book updateReadingProgress(Long id, Integer currentPage, String review, Integer rating, String status) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Book not found with ID: " + id));

        if (currentPage != null) {
            if (book.getPageCount() != null && currentPage > book.getPageCount()) {
                throw new IllegalArgumentException("Current page cannot exceed total page count of " + book.getPageCount());
            }
            book.setCurrentPage(currentPage);
        }
        
        if (review != null) book.setReview(review);
        if (rating != null) book.setRating(rating);
        if (status != null) book.setReadingStatus(status.toUpperCase());

        return bookRepository.save(book);
    }

    // --- LIBRARY METRICS & ANALYTICS ---

    /**
     * Calculates the total pages read of all completed books.
     */
    public Long getTotalPagesRead() {
        Long pages = bookRepository.calculateTotalPagesRead();
        return pages != null ? pages : 0L;
    }

    /**
     * Retrieves statistics of books grouped by genres.
     */
    public List<Object[]> getGenreDistribution() {
        return bookRepository.countBooksByGenre();
    }
}
