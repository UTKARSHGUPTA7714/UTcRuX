package com.crux.app.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.crux.app.model.CruxContent
import kotlinx.coroutines.flow.Flow

@Dao
interface CruxDao {
    @Query("SELECT * FROM crux_content WHERE status = 'PUBLISHED' ORDER BY priority ASC, published_at DESC")
    fun getAllPublishedContent(): Flow<List<CruxContent>>

    @Query("SELECT * FROM crux_content WHERE status = 'PUBLISHED' ORDER BY priority ASC, published_at DESC")
    suspend fun getPublishedList(): List<CruxContent>

    @Query("SELECT * FROM crux_content WHERE status = 'PUBLISHED' ORDER BY priority ASC, published_at DESC LIMIT 1")
    suspend fun getLatestPublishedContent(): CruxContent?

    @Query("SELECT * FROM crux_content WHERE type = :type AND status = 'PUBLISHED' ORDER BY published_at DESC")
    fun getContentByType(type: String): Flow<List<CruxContent>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(items: List<CruxContent>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(item: CruxContent)

    @Query("DELETE FROM crux_content")
    suspend fun clearAll()
}
