package com.bookverse.api.repository;

import com.bookverse.api.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Book Entity.
 * Extends JpaRepository to inherit robust CRUD, pagination, and sorting features
 * without writing boilerplate SQL/JPQL queries.
 */
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    /**
     * Find a book in the database by its unique Google Books API ID.
     */
    Optional<Book> findByGoogleBooksId(String googleBooksId);

    /**
     * Find all books in the database that match a specific reading status.
     * Status can be: "WISHLIST", "READING", "COMPLETED"
     */
    List<Book> findByReadingStatus(String readingStatus);

    /**
     * Search books in the local library by matching titles or authors.
     */
    @Query("SELECT b FROM Book b WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(b.authors) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Book> searchLocalLibrary(@Param("keyword") String keyword);

    /**
     * Custom aggregation: Get count of books grouped by genre/category.
     * Note: Since categories can be comma-separated, standard JpaRepository can't split,
     * but this JPQL queries books that have categories assigned.
     */
    @Query("SELECT b.categories, COUNT(b) FROM Book b WHERE b.categories IS NOT NULL GROUP BY b.categories")
    List<Object[]> countBooksByGenre();

    /**
     * Get the sum of all pages read in books marked as COMPLETED.
     */
    @Query("SELECT SUM(b.pageCount) FROM Book b WHERE b.readingStatus = 'COMPLETED'")
    Long calculateTotalPagesRead();
}
