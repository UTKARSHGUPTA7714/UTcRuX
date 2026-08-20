package com.crux.app.ui.screens

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.crux.app.widget.CruxWidgetReceiver

@Composable
fun OnboardingScreen(
    onContinueToApp: () -> Unit
) {
    val context = LocalContext.current

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF080808))
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Header
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(top = 40.dp)
        ) {
            Text(
                text = "CRUX",
                color = Color.White,
                fontSize = 36.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                letterSpacing = 4.sp
            )
            Text(
                text = "by UTCRUX",
                color = Color(0xFFD00000),
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                letterSpacing = 2.sp,
                modifier = Modifier.padding(top = 4.dp)
            )
            Text(
                text = "YOUR HOME-SCREEN COMPANION",
                color = Color(0xFF888888),
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace,
                letterSpacing = 1.sp,
                modifier = Modifier.padding(top = 6.dp)
            )
        }

        // Feature Explanation Cards (Nothing OS Minimalist Aesthetic)
        Column(
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            OnboardingStepCard(
                step = "01",
                title = "GLANCEABLE CONTENT",
                description = "Quotes, facts, brain teasers, polls, and urgent campus updates right on your home screen."
            )
            OnboardingStepCard(
                step = "02",
                title = "MINIMALIST DESIGN",
                description = "Monochrome, dot-matrix inspired UI designed for minimal distraction and modern aesthetics."
            )
            OnboardingStepCard(
                step = "03",
                title = "OFFLINE FIRST",
                description = "Always available. Zero blank widgets when disconnected from internet."
            )
        }

        // Action Buttons
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Button(
                onClick = {
                    requestPinWidget(context)
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.White,
                    contentColor = Color.Black
                )
            ) {
                Text(
                    text = "ADD WIDGET TO HOME SCREEN",
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    modifier = Modifier.padding(vertical = 6.dp)
                )
            }

            OutlinedButton(
                onClick = onContinueToApp,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                border = ButtonDefaults.outlinedButtonBorder.copy(brush = androidx.compose.ui.graphics.SolidColor(Color(0xFF333333))),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White)
            ) {
                Text(
                    text = "EXPLORE APP",
                    fontFamily = FontFamily.Monospace,
                    modifier = Modifier.padding(vertical = 6.dp)
                )
            }
        }
    }
}

@Composable
fun OnboardingStepCard(
    step: String,
    title: String,
    description: String
) {
    Surface(
        color = Color(0xFF121212),
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Color(0xFF262626), RoundedCornerShape(16.dp))
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = step,
                color = Color(0xFFD00000),
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                modifier = Modifier.padding(end = 16.dp)
            )
            Column {
                Text(
                    text = title,
                    color = Color.White,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = description,
                    color = Color(0xFFAAAAAA),
                    fontSize = 11.sp,
                    modifier = Modifier.padding(top = 4.dp),
                    lineHeight = 16.sp
                )
            }
        }
    }
}

private fun requestPinWidget(context: Context) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val appWidgetManager = AppWidgetManager.getInstance(context)
        val myProvider = ComponentName(context, CruxWidgetReceiver::class.java)
        if (appWidgetManager.isRequestPinAppWidgetSupported) {
            val successCallback = PendingIntent.getBroadcast(
                context,
                0,
                Intent(context, CruxWidgetReceiver::class.java),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            appWidgetManager.requestPinAppWidget(myProvider, null, successCallback)
        }
    }
}
