package com.crux.app.service

import android.util.Log
import com.crux.app.data.CruxDatabase
import com.crux.app.network.CruxApiService
import com.crux.app.repository.CruxRepository
import com.crux.app.widget.updateAllCruxWidgets
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class CruxFirebaseMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        Log.d(TAG, "FCM Signal Received from ${remoteMessage.from}")

        val data = remoteMessage.data
        val type = data["type"] ?: "CRUX_UPDATED"
        val contentId = data["contentId"] ?: ""

        Log.d(TAG, "FCM Payload: type=$type, contentId=$contentId")

        if (type == "CRUX_UPDATED") {
            val database = CruxDatabase.getDatabase(applicationContext)
            val apiService = CruxApiService.create()
            val repository = CruxRepository(applicationContext, apiService, database.cruxDao())

            CoroutineScope(Dispatchers.IO).launch {
                try {
                    Log.d(TAG, "Fetching authoritative content from API after FCM signal...")
                    val result = repository.refreshContent()
                    if (result.isSuccess) {
                        Log.d(TAG, "Content successfully synchronized to Room DB. Updating Glance widgets...")
                        updateAllCruxWidgets(applicationContext)
                    } else {
                        Log.w(TAG, "Content refresh failed: ${result.exceptionOrNull()?.message}")
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error handling FCM content update", e)
                }
            }
        }
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "Refreshed FCM Device Token: $token")
    }

    companion object {
        private const val TAG = "CruxFCMService"
    }
}
