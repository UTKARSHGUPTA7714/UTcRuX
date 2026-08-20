package com.crux.app.service

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.crux.app.data.CruxDatabase
import com.crux.app.network.CruxApiService
import com.crux.app.repository.CruxRepository
import com.crux.app.widget.updateAllCruxWidgets

class CruxSyncWorker(
    context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        Log.d(TAG, "Executing periodic WorkManager background catchup sync...")
        return try {
            val database = CruxDatabase.getDatabase(applicationContext)
            val apiService = CruxApiService.create()
            val repository = CruxRepository(applicationContext, apiService, database.cruxDao())
            val refreshResult = repository.refreshContent()

            if (refreshResult.isSuccess) {
                Log.d(TAG, "WorkManager sync successful. Updating Glance widgets...")
                updateAllCruxWidgets(applicationContext)
                Result.success()
            } else {
                Log.w(TAG, "WorkManager sync failed: ${refreshResult.exceptionOrNull()?.message}")
                Result.retry()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in CruxSyncWorker execution", e)
            Result.retry()
        }
    }

    companion object {
        private const val TAG = "CruxSyncWorker"
        const val WORK_NAME = "CruxPeriodicSyncWorker"
    }
}
