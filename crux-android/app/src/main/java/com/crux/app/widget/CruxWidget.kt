package com.crux.app.widget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.GlanceTheme
import androidx.glance.LocalSize
import androidx.glance.action.ActionParameters
import androidx.glance.action.actionParametersOf
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.action.ActionCallback
import androidx.glance.appwidget.action.actionRunCallback
import androidx.glance.appwidget.lazy.LazyColumn
import androidx.glance.appwidget.lazy.itemsIndexed
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.color.ColorProvider
import androidx.glance.currentState
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.width
import androidx.glance.state.GlanceStateDefinition
import androidx.glance.state.PreferencesGlanceStateDefinition
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import com.crux.app.data.CruxDatabase
import com.crux.app.model.CruxContent
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

val CURRENT_CARD_INDEX_KEY = intPreferencesKey("current_card_index")
val GAME_ANSWERED_STATE_KEY = stringPreferencesKey("game_answered_state") // "NONE", "CORRECT", "INCORRECT"
val GAME_SELECTED_OPTION_KEY = stringPreferencesKey("game_selected_option")
val GAME_SCORE_KEY = intPreferencesKey("game_score")
val GAME_SCORED_ITEMS_KEY = stringPreferencesKey("game_scored_items")
val OPTION_PARAM_KEY = ActionParameters.Key<String>("selected_option_param")

class CruxWidget : GlanceAppWidget() {

    override val sizeMode: SizeMode = SizeMode.Exact
    override val stateDefinition: GlanceStateDefinition<*> = PreferencesGlanceStateDefinition

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val database = CruxDatabase.getDatabase(context)
        val items = withContext(Dispatchers.IO) {
            database.cruxDao().getPublishedList()
        }

        val displayItems = if (items.isNotEmpty()) items else listOf(
            CruxContent(
                id = "game_001",
                type = "GAME",
                title = "QUICK MATH REFLEX",
                body = "2 + 2 × 4 = ?",
                short_text = "Calculate: 2 + 2 × 4",
                published_at = "2026-08-20T10:05:00Z",
                question = "2 + 2 × 4 = ?",
                options = "8, 10, 12, 16",
                correct_answer = "10",
                explanation = "Multiplication is performed before addition.",
                difficulty = "EASY",
                points = 10
            ),
            CruxContent(
                id = "crux_001",
                type = "CRUX",
                title = "Tomorrow's classes will be online.",
                body = "Classes online tomorrow due to campus maintenance.",
                short_text = "Classes online tomorrow.",
                published_at = "2026-08-20T10:05:00Z"
            ),
            CruxContent(
                id = "quote_001",
                type = "QUOTE",
                title = "DAILY MOTIVATION",
                body = "Consistency beats intensity. Micro-habits compound into extraordinary transformations over time.",
                short_text = "Consistency beats intensity.",
                published_at = "2026-08-20T08:00:00Z"
            ),
            CruxContent(
                id = "fact_001",
                type = "FACT",
                title = "DID YOU KNOW?",
                body = "Octopuses have three hearts and blue blood.",
                short_text = "Octopuses have three hearts.",
                published_at = "2026-08-20T07:00:00Z"
            ),
            CruxContent(
                id = "question_001",
                type = "QUESTION",
                title = "TODAY'S BRAIN TEASER",
                body = "What comes next in the sequence? 2, 4, 8, 16, ?",
                short_text = "Sequence: 2, 4, 8, 16, ?",
                published_at = "2026-08-20T06:00:00Z"
            )
        )

        provideContent {
            val prefs = currentState<Preferences>()
            val rawIndex = prefs[CURRENT_CARD_INDEX_KEY] ?: 0
            val safeIndex = ((rawIndex % displayItems.size) + displayItems.size) % displayItems.size

            val gameAnsweredState = prefs[GAME_ANSWERED_STATE_KEY] ?: "NONE"
            val gameSelectedOption = prefs[GAME_SELECTED_OPTION_KEY] ?: ""
            val gameScore = prefs[GAME_SCORE_KEY] ?: 0

            GlanceTheme {
                CruxWidgetContent(
                    displayItems = displayItems,
                    currentIndex = safeIndex,
                    gameAnsweredState = gameAnsweredState,
                    gameSelectedOption = gameSelectedOption,
                    gameScore = gameScore
                )
            }
        }
    }
}

private fun color(hex: Long) = ColorProvider(day = Color(hex), night = Color(hex))

@Composable
fun CruxWidgetContent(
    displayItems: List<CruxContent>,
    currentIndex: Int,
    gameAnsweredState: String,
    gameSelectedOption: String,
    gameScore: Int
) {
    val size = LocalSize.current
    val isSmall = size.width < 180.dp || size.height < 180.dp
    val isLarge = size.width >= 260.dp && size.height >= 260.dp

    val containerPadding: Dp = if (isSmall) 10.dp else if (isLarge) 18.dp else 14.dp
    val titleFontSize: TextUnit = if (isSmall) 14.sp else if (isLarge) 22.sp else 18.sp
    val bodyFontSize: TextUnit = if (isSmall) 10.sp else if (isLarge) 14.sp else 12.sp

    val currentContent = displayItems.getOrElse(currentIndex) { displayItems[0] }

    Box(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(color(0xFF080808L))
            .padding(containerPadding),
        contentAlignment = Alignment.TopStart
    ) {
        Column(
            modifier = GlanceModifier.fillMaxSize()
        ) {
            // Top Bar: Clean UTcRuX Branding Header
            Row(
                modifier = GlanceModifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "UTcRuX",
                    style = TextStyle(
                        color = color(0xFFD00000L),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
            }

            Spacer(modifier = GlanceModifier.height(6.dp))

            // Main Content Area wrapped in Glance LazyColumn for Native AppWidget Vertical Swiping
            LazyColumn(
                modifier = GlanceModifier.fillMaxWidth().defaultWeight()
            ) {
                item {
                    if (currentContent.type.uppercase() == "GAME") {
                        RenderMcqGameContent(
                            content = currentContent,
                            gameAnsweredState = gameAnsweredState,
                            gameSelectedOption = gameSelectedOption,
                            gameScore = gameScore,
                            isSmall = isSmall,
                            titleFontSize = titleFontSize,
                            bodyFontSize = bodyFontSize
                        )
                    } else {
                        RenderStandardCruxContent(
                            content = currentContent,
                            titleFontSize = titleFontSize,
                            bodyFontSize = bodyFontSize,
                            isSmall = isSmall
                        )
                    }
                }
            }

            Spacer(modifier = GlanceModifier.height(6.dp))

            // Footer: Timestamp, Jump-To-Game ▶ Icon & Navigation Controls
            Row(
                modifier = GlanceModifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = formatTimestamp(currentContent.published_at),
                    style = TextStyle(
                        color = color(0xFF777777L),
                        fontSize = 9.sp
                    )
                )
                Spacer(modifier = GlanceModifier.defaultWeight())
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Jump-to-Game ▶ Quick Access Icon Button
                    Box(
                        modifier = GlanceModifier
                            .width(44.dp)
                            .height(36.dp)
                            .clickable(actionRunCallback<JumpToGameAction>()),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "▶",
                            style = TextStyle(
                                color = color(0xFFFF9800L),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }

                    Spacer(modifier = GlanceModifier.width(4.dp))

                    Box(
                        modifier = GlanceModifier
                            .width(44.dp)
                            .height(36.dp)
                            .clickable(actionRunCallback<PrevCardAction>()),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "‹",
                            style = TextStyle(
                                color = color(0xFFFFFFFFL),
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                    Text(
                        text = String.format("%02d/%02d", currentIndex + 1, displayItems.size),
                        style = TextStyle(
                            color = color(0xFF999999L),
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                    Box(
                        modifier = GlanceModifier
                            .width(44.dp)
                            .height(36.dp)
                            .clickable(actionRunCallback<NextCardAction>()),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "›",
                            style = TextStyle(
                                color = color(0xFFFFFFFFL),
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun RenderStandardCruxContent(
    content: CruxContent,
    titleFontSize: TextUnit,
    bodyFontSize: TextUnit,
    isSmall: Boolean
) {
    Column {
        Text(
            text = content.title.uppercase(),
            style = TextStyle(
                color = color(0xFFFFFFFFL),
                fontSize = titleFontSize,
                fontWeight = FontWeight.Bold
            ),
            maxLines = if (isSmall) 2 else 3
        )

        Spacer(modifier = GlanceModifier.height(6.dp))

        Text(
            text = (content.short_text ?: content.body),
            style = TextStyle(
                color = color(0xFFCCCCCCL),
                fontSize = bodyFontSize
            ),
            maxLines = if (isSmall) 3 else 5
        )
    }
}

@Composable
fun RenderMcqGameContent(
    content: CruxContent,
    gameAnsweredState: String,
    gameSelectedOption: String,
    gameScore: Int,
    isSmall: Boolean,
    titleFontSize: TextUnit,
    bodyFontSize: TextUnit
) {
    val questionText = content.question ?: content.body
    val rawOptions = content.options ?: "8, 10, 12, 16"
    val optionsList = rawOptions.split(",").map { it.trim() }

    Column {
        Text(
            text = content.title.uppercase(),
            style = TextStyle(
                color = color(0xFFFF9800L),
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold
            )
        )

        Spacer(modifier = GlanceModifier.height(4.dp))

        Text(
            text = questionText,
            style = TextStyle(
                color = color(0xFFFFFFFFL),
                fontSize = titleFontSize,
                fontWeight = FontWeight.Bold
            ),
            maxLines = 2
        )

        Spacer(modifier = GlanceModifier.height(8.dp))

        if (gameAnsweredState == "NONE") {
            // Render 4 Interactive Answer Option Buttons in 2x2 Grid Layout
            val chunkedOptions = optionsList.chunked(2)
            chunkedOptions.forEach { rowOptions ->
                Row(
                    modifier = GlanceModifier.fillMaxWidth().padding(vertical = 2.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    rowOptions.forEach { option ->
                        Box(
                            modifier = GlanceModifier
                                .defaultWeight()
                                .height(if (isSmall) 28.dp else 34.dp)
                                .background(color(0xFF1E1E1EL))
                                .padding(horizontal = 4.dp, vertical = 2.dp)
                                .clickable(actionRunCallback<SelectMcqOptionAction>(actionParametersOf(OPTION_PARAM_KEY to option))),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = option,
                                style = TextStyle(
                                    color = color(0xFFFFFFFFL),
                                    fontSize = if (isSmall) 11.sp else 13.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }
                        Spacer(modifier = GlanceModifier.width(6.dp))
                    }
                }
            }
        } else {
            // Render Answer Result Feedback State
            val isCorrect = gameAnsweredState == "CORRECT"
            Box(
                modifier = GlanceModifier
                    .fillMaxWidth()
                    .background(color(if (isCorrect) 0xFF1B5E20L else 0xFFB71C1CL))
                    .padding(8.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = if (isCorrect) "✓ CORRECT! +10 PTS" else "✕ INCORRECT",
                        style = TextStyle(
                            color = color(0xFFFFFFFFL),
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                    if (!isCorrect && !content.correct_answer.isNullOrEmpty()) {
                        Text(
                            text = "Correct Answer: ${content.correct_answer}",
                            style = TextStyle(
                                color = color(0xFFFFCDD2L),
                                fontSize = 10.sp
                            )
                        )
                    }
                    Text(
                        text = "SCORE: $gameScore PTS",
                        style = TextStyle(
                            color = color(0xFFFFD54FL),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }
        }
    }
}

private fun formatTimestamp(isoStr: String?): String {
    if (isoStr.isNullOrEmpty()) return "02:20 · 21 AUG"
    return try {
        val instant = java.time.Instant.parse(isoStr)
        val localDateTime = instant.atZone(java.time.ZoneId.systemDefault())
        val formatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm · dd MMM", java.util.Locale.US)
        localDateTime.format(formatter).uppercase()
    } catch (e: Exception) {
        try {
            val parts = isoStr.split("T")
            val timePart = if (parts.size > 1) parts[1].take(5) else "00:00"
            "$timePart · ${parts[0]}"
        } catch (e2: Exception) {
            "02:20 · 21 AUG"
        }
    }
}

class SelectMcqOptionAction : ActionCallback {
    override suspend fun onAction(
        context: Context,
        glanceId: GlanceId,
        parameters: ActionParameters
    ) {
        val selectedOption = parameters[OPTION_PARAM_KEY] ?: ""
        val database = CruxDatabase.getDatabase(context)
        val items = withContext(Dispatchers.IO) {
            database.cruxDao().getPublishedList()
        }

        androidx.glance.appwidget.state.updateAppWidgetState(context, glanceId) { prefs ->
            val rawIndex = prefs[CURRENT_CARD_INDEX_KEY] ?: 0
            val displayItems = if (items.isNotEmpty()) items else listOf()
            val safeIndex = if (displayItems.isNotEmpty()) ((rawIndex % displayItems.size) + displayItems.size) % displayItems.size else 0
            val currentItem = displayItems.getOrNull(safeIndex)

            val correctAnswer = currentItem?.correct_answer ?: "10"
            val isCorrect = selectedOption.trim() == correctAnswer.trim()

            prefs[GAME_ANSWERED_STATE_KEY] = if (isCorrect) "CORRECT" else "INCORRECT"
            prefs[GAME_SELECTED_OPTION_KEY] = selectedOption

            val currentScore = prefs[GAME_SCORE_KEY] ?: 0
            val scoredItems = prefs[GAME_SCORED_ITEMS_KEY] ?: ""
            val itemId = currentItem?.id ?: "game_001"

            val alreadyScored = scoredItems.split(",").contains(itemId)

            if (isCorrect && !alreadyScored) {
                prefs[GAME_SCORE_KEY] = currentScore + (currentItem?.points ?: 10)
                prefs[GAME_SCORED_ITEMS_KEY] = if (scoredItems.isEmpty()) itemId else "$scoredItems,$itemId"
            }
        }
        CruxWidget().update(context, glanceId)
    }
}

class NextCardAction : ActionCallback {
    override suspend fun onAction(
        context: Context,
        glanceId: GlanceId,
        parameters: ActionParameters
    ) {
        val database = CruxDatabase.getDatabase(context)
        val itemCount = withContext(Dispatchers.IO) {
            val count = database.cruxDao().getPublishedList().size
            if (count > 0) count else 5
        }
        androidx.glance.appwidget.state.updateAppWidgetState(context, glanceId) { prefs ->
            val current = prefs[CURRENT_CARD_INDEX_KEY] ?: 0
            prefs[CURRENT_CARD_INDEX_KEY] = (current + 1) % itemCount
            prefs[GAME_ANSWERED_STATE_KEY] = "NONE" // Reset MCQ state on card change
        }
        CruxWidget().update(context, glanceId)
    }
}

class PrevCardAction : ActionCallback {
    override suspend fun onAction(
        context: Context,
        glanceId: GlanceId,
        parameters: ActionParameters
    ) {
        val database = CruxDatabase.getDatabase(context)
        val itemCount = withContext(Dispatchers.IO) {
            val count = database.cruxDao().getPublishedList().size
            if (count > 0) count else 5
        }
        androidx.glance.appwidget.state.updateAppWidgetState(context, glanceId) { prefs ->
            val current = prefs[CURRENT_CARD_INDEX_KEY] ?: 0
            prefs[CURRENT_CARD_INDEX_KEY] = (current - 1 + itemCount) % itemCount
            prefs[GAME_ANSWERED_STATE_KEY] = "NONE" // Reset MCQ state on card change
        }
        CruxWidget().update(context, glanceId)
    }
}

class JumpToGameAction : ActionCallback {
    override suspend fun onAction(
        context: Context,
        glanceId: GlanceId,
        parameters: ActionParameters
    ) {
        val database = CruxDatabase.getDatabase(context)
        val items = withContext(Dispatchers.IO) {
            database.cruxDao().getPublishedList()
        }
        val displayItems = if (items.isNotEmpty()) items else listOf(
            CruxContent(
                id = "game_001",
                type = "GAME",
                title = "QUICK MATH REFLEX",
                body = "2 + 2 × 4 = ?",
                published_at = "2026-08-20T10:05:00Z"
            )
        )
        val gameIndex = displayItems.indexOfFirst { it.type.equals("GAME", ignoreCase = true) }

        if (gameIndex >= 0) {
            androidx.glance.appwidget.state.updateAppWidgetState(context, glanceId) { prefs ->
                prefs[CURRENT_CARD_INDEX_KEY] = gameIndex
                prefs[GAME_ANSWERED_STATE_KEY] = "NONE"
            }
            CruxWidget().update(context, glanceId)
        }
    }
}

class CruxWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = CruxWidget()
}

suspend fun updateAllCruxWidgets(context: Context) {
    try {
        val manager = androidx.glance.appwidget.GlanceAppWidgetManager(context)
        val glanceIds = manager.getGlanceIds(CruxWidget::class.java)
        glanceIds.forEach { glanceId ->
            CruxWidget().update(context, glanceId)
        }
    } catch (e: Exception) {
        e.printStackTrace()
    }
}
