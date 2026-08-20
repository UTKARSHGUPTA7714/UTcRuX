package com.crux.app.network

import com.crux.app.model.CruxContent
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface CruxApiService {
    @GET("content/latest")
    suspend fun getLatestContent(): Response<CruxContent>

    @GET("content/feed")
    suspend fun getContentFeed(
        @Query("limit") limit: Int = 20
    ): Response<List<CruxContent>>

    @GET("content/{id}")
    suspend fun getContentById(
        @Path("id") id: String
    ): Response<CruxContent>

    @GET("content/category/{category}")
    suspend fun getContentByCategory(
        @Path("category") category: String
    ): Response<List<CruxContent>>

    companion object {
        // Development LAN IP default for local server testing
        const val DEV_BASE_URL = "http://192.168.1.7:3000/"
        
        // Production Cloudflare Worker HTTPS URL for public internet distribution
        const val PROD_BASE_URL = "https://crux-api.utcrux.workers.dev/"

        fun create(baseUrl: String = PROD_BASE_URL): CruxApiService {
            return Retrofit.Builder()
                .baseUrl(baseUrl)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(CruxApiService::class.java)
        }
    }
}
