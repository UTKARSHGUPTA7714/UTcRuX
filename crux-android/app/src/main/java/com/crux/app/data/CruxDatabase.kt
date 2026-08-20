package com.crux.app.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.crux.app.model.CruxContent

@Database(entities = [CruxContent::class], version = 2, exportSchema = false)
abstract class CruxDatabase : RoomDatabase() {
    abstract fun cruxDao(): CruxDao

    companion object {
        @Volatile
        private var INSTANCE: CruxDatabase? = null

        fun getDatabase(context: Context): CruxDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    CruxDatabase::class.java,
                    "crux_database"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
