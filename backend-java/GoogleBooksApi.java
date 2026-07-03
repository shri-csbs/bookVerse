package com.bookverse.api.integration;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;

/**
 * Service Integration class that handles raw communication with the external Google Books API.
 * This file corresponds to "2" and "4" in the communication architecture diagram.
 */
@Component
public class GoogleBooksApi {

    private final RestTemplate restTemplate;
    private static final String GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1/volumes";

    // Injecting API Key from application.properties if available, otherwise runs unauthenticated (public queries)
    @Value("${google.books.api.key:}")
    private String apiKey;

    public GoogleBooksApi() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Queries the Google Books API with a search query string.
     * Maps to the 'Search Books' module in the architecture layout.
     * 
     * @param query The search keyword (e.g., title, author, subject)
     * @return Raw JSON response from the Google Books endpoint
     */
    public String searchBooks(String query, int maxResults) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(GOOGLE_BOOKS_BASE_URL)
                .queryParam("q", query)
                .queryParam("maxResults", maxResults);

        if (apiKey != null && !apiKey.isEmpty()) {
            builder.queryParam("key", apiKey);
        }

        String url = builder.toUriString();
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        return response.getBody();
    }

    /**
     * Retrieves detail information for a specific book by its Google Books Volume ID.
     * Maps to the 'Book Details Page' in the architecture layout.
     * 
     * @param volumeId The volume identifier (e.g., "yE6_EAAAQBAJ")
     * @return Raw JSON response from the Google Books Volume Details endpoint
     */
    public String getBookDetails(String volumeId) {
        String url = GOOGLE_BOOKS_BASE_URL + "/" + volumeId;
        
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url);
        if (apiKey != null && !apiKey.isEmpty()) {
            builder.queryParam("key", apiKey);
        }

        ResponseEntity<String> response = restTemplate.getForEntity(builder.toUriString(), String.class);
        return response.getBody();
    }
}
