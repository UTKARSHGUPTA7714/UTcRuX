package com.crux.app.repository

import android.content.Context
import com.crux.app.data.CruxDao
import com.crux.app.model.CruxContent
import com.crux.app.network.CruxApiService
import com.crux.app.widget.updateAllCruxWidgets
import kotlinx.coroutines.flow.Flow

class CruxRepository(
    private val context: Context,
    private val apiService: CruxApiService,
    private val cruxDao: CruxDao
) {
    val allPublishedFeed: Flow<List<CruxContent>> = cruxDao.getAllPublishedContent()

    suspend fun refreshContent(): Result<List<CruxContent>> {
        return try {
            val response = apiService.getContentFeed(limit = 30)
            if (response.isSuccessful && response.body() != null) {
                val feed = response.body()!!
                cruxDao.insertAll(feed)
                updateAllCruxWidgets(context)
                Result.success(feed)
            } else {
                Result.failure(Exception("API Error: ${response.code()}"))
            }
        } catch (e: Exception) {
            // Offline fallback: Room database retains existing cached content
            Result.failure(e)
        }
    }

    suspend fun getLatestContent(): CruxContent? {
        return try {
            val response = apiService.getLatestContent()
            if (response.isSuccessful && response.body() != null) {
                val item = response.body()!!
                cruxDao.insert(item)
                updateAllCruxWidgets(context)
                item
            } else {
                cruxDao.getLatestPublishedContent()
            }
        } catch (e: Exception) {
            cruxDao.getLatestPublishedContent()
        }
    }

    fun getContentByType(type: String): Flow<List<CruxContent>> {
        return cruxDao.getContentByType(type)
    }
}
