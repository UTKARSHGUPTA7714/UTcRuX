package com.crux.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.crux.app.data.CruxDatabase
import com.crux.app.model.CruxContent
import com.crux.app.network.CruxApiService
import com.crux.app.repository.CruxRepository
import com.crux.app.ui.screens.FeedScreen
import com.crux.app.ui.screens.OnboardingScreen
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private lateinit var repository: CruxRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val database = CruxDatabase.getDatabase(applicationContext)
        val apiService = CruxApiService.create()
        repository = CruxRepository(applicationContext, apiService, database.cruxDao())

        setContent {
            MaterialTheme {
                CruxApp(repository = repository)
            }
        }
    }
}

@Composable
fun CruxApp(repository: CruxRepository) {
    var showOnboarding by remember { mutableStateOf(true) }
    var selectedTab by remember { mutableStateOf(0) }
    val scope = rememberCoroutineScope()

    val feedItems by repository.allPublishedFeed.collectAsState(initial = emptyList())
    var isRefreshing by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        scope.launch {
            isRefreshing = true
            repository.refreshContent()
            isRefreshing = false
        }
    }

    if (showOnboarding) {
        OnboardingScreen(
            onContinueToApp = { showOnboarding = false }
        )
    } else {
        Scaffold(
            bottomBar = {
                NavigationBar(
                    containerColor = Color(0xFF121212),
                    contentColor = Color.White
                ) {
                    NavigationBarItem(
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        icon = { Text("▚", fontSize = 16.sp, color = if (selectedTab == 0) Color(0xFFD00000) else Color.Gray) },
                        label = { Text("FEED", fontFamily = FontFamily.Monospace, fontSize = 10.sp) }
                    )
                    NavigationBarItem(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        icon = { Text("🎮", fontSize = 16.sp, color = if (selectedTab == 1) Color(0xFFD00000) else Color.Gray) },
                        label = { Text("GAMES", fontFamily = FontFamily.Monospace, fontSize = 10.sp) }
                    )
                    NavigationBarItem(
                        selected = selectedTab == 2,
                        onClick = { selectedTab = 2 },
                        icon = { Text("⚙", fontSize = 16.sp, color = if (selectedTab == 2) Color(0xFFD00000) else Color.Gray) },
                        label = { Text("SETTINGS", fontFamily = FontFamily.Monospace, fontSize = 10.sp) }
                    )
                }
            }
        ) { paddingValues ->
            Box(modifier = Modifier.padding(paddingValues)) {
                when (selectedTab) {
                    0 -> FeedScreen(
                        feedItems = feedItems,
                        isRefreshing = isRefreshing,
                        onRefresh = {
                            scope.launch {
                                isRefreshing = true
                                repository.refreshContent()
                                isRefreshing = false
                            }
                        }
                    )
                    1 -> SimpleGamesPlaceholder()
                    2 -> SettingsPlaceholder()
                }
            }
        }
    }
}

@Composable
fun SimpleGamesPlaceholder() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF080808))
            .padding(24.dp)
    ) {
        Text(
            text = "DAILY WIDGET GAMES",
            color = Color.White,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace,
            letterSpacing = 2.sp,
            modifier = Modifier.padding(bottom = 20.dp)
        )
        Surface(
            color = Color(0xFF121212),
            shape = androidx.compose.foundation.shape.RoundedCornerShape(16.dp),
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(text = "GAME #1: MATH REFLEX", color = Color(0xFFD00000), fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                Text(text = "Calculate: 2 + 2 × 4 = ?", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(vertical = 8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Button(onClick = {}, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF222222))) {
                        Text("10 (Correct)", color = Color.White, fontFamily = FontFamily.Monospace)
                    }
                    Button(onClick = {}, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF222222))) {
                        Text("16", color = Color.White, fontFamily = FontFamily.Monospace)
                    }
                }
            }
        }
    }
}

@Composable
fun SettingsPlaceholder() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF080808))
            .padding(24.dp)
    ) {
        Text(
            text = "CRUX",
            color = Color.White,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace,
            letterSpacing = 2.sp
        )
        Text(
            text = "A daily home-screen companion.",
            color = Color(0xFFCCCCCC),
            fontSize = 13.sp,
            fontFamily = FontFamily.Monospace,
            modifier = Modifier.padding(top = 4.dp)
        )
        Text(
            text = "Created by UTCRUX",
            color = Color(0xFFD00000),
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace,
            modifier = Modifier.padding(top = 4.dp, bottom = 24.dp)
        )
        Text(text = "VERSION 1.0.0 (MVP)", color = Color(0xFF888888), fontFamily = FontFamily.Monospace)
        Text(text = "SERVER: http://192.168.1.7:3000", color = Color(0xFF888888), fontFamily = FontFamily.Monospace, modifier = Modifier.padding(top = 8.dp))
        Text(text = "OFFLINE CACHE: ACTIVE (ROOM DB)", color = Color(0xFF4CAF50), fontFamily = FontFamily.Monospace, modifier = Modifier.padding(top = 8.dp))
    }
}
