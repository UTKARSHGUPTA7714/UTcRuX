package com.crux.app.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "crux_content")
data class CruxContent(
    @PrimaryKey
    val id: String,
    val type: String, // CRUX, QUOTE, FACT, QUESTION, POLL, GAME, EVENT, ALERT
    val title: String,
    val body: String,
    val short_text: String? = null,
    val author: String? = "CRUX",
    val category: String? = "General",
    val image_url: String? = null,
    val status: String = "PUBLISHED", // DRAFT, SCHEDULED, PUBLISHED, EXPIRED, ARCHIVED
    val priority: Int = 5,
    val published_at: String? = null,
    val scheduled_at: String? = null,
    val created_at: String? = null,
    val updated_at: String? = null,
    val expires_at: String? = null,
    
    // MCQ & Interactive Game Fields
    val question: String? = null,
    val options: String? = null, // Comma-separated or JSON list: "8, 10, 12, 16"
    val correct_answer: String? = null,
    val explanation: String? = null,
    val difficulty: String? = "EASY",
    val points: Int = 10
)
