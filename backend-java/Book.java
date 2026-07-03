package com.bookverse.api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity class representing a Book in the Bookverse application database.
 * This class maps directly to the "books" table in the relational database.
 */
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
    private String authors; // Stored as comma-separated values or JSON string

    private String publisher;
    private String publishedDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer pageCount;
    private String categories; // Stored as comma-separated genres/categories
    private String thumbnail;

    // User-specific custom fields
    private String readingStatus; // "WISHLIST", "READING", "COMPLETED"
    private Integer currentPage;
    private Integer rating; // User rating out of 5 stars

    @Column(columnDefinition = "TEXT")
    private String review; // User notes or review

    private LocalDateTime dateAdded;
    private LocalDateTime dateUpdated;

    // Constructors
    public Book() {
        this.dateAdded = LocalDateTime.now();
        this.dateUpdated = LocalDateTime.now();
        this.currentPage = 0;
        this.rating = 0;
    }

    public Book(String googleBooksId, String title, String authors, String publisher, 
                String publishedDate, String description, Integer pageCount, 
                String categories, String thumbnail, String readingStatus) {
        this();
        this.googleBooksId = googleBooksId;
        this.title = title;
        this.authors = authors;
        this.publisher = publisher;
        this.publishedDate = publishedDate;
        this.description = description;
        this.pageCount = pageCount;
        this.categories = categories;
        this.thumbnail = thumbnail;
        this.readingStatus = readingStatus;
    }

    // Lifecycle Callbacks
    @PreUpdate
    protected void onUpdate() {
        this.dateUpdated = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getGoogleBooksId() { return googleBooksId; }
    public void setGoogleBooksId(String googleBooksId) { this.googleBooksId = googleBooksId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthors() { return authors; }
    public void setAuthors(String authors) { this.authors = authors; }

    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }

    public String getPublishedDate() { return publishedDate; }
    public void setPublishedDate(String publishedDate) { this.publishedDate = publishedDate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getPageCount() { return pageCount; }
    public void setPageCount(Integer pageCount) { this.pageCount = pageCount; }

    public String getCategories() { return categories; }
    public void setCategories(String categories) { this.categories = categories; }

    public String getThumbnail() { return thumbnail; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }

    public String getReadingStatus() { return readingStatus; }
    public void setReadingStatus(String readingStatus) { this.readingStatus = readingStatus; }

    public Integer getCurrentPage() { return currentPage; }
    public void setCurrentPage(Integer currentPage) { this.currentPage = currentPage; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getReview() { return review; }
    public void setReview(String review) { this.review = review; }

    public LocalDateTime getDateAdded() { return dateAdded; }
    public void setDateAdded(LocalDateTime dateAdded) { this.dateAdded = dateAdded; }

    public LocalDateTime getDateUpdated() { return dateUpdated; }
    public void setDateUpdated(LocalDateTime dateUpdated) { this.dateUpdated = dateUpdated; }
}
