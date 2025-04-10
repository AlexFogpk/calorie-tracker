"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const openai_1 = __importDefault(require("openai"));
// import cors from 'cors'; // Removed unused import
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set in environment variables');
    process.exit(1);
}
// Initialize OpenAI
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY
});
// Simplified validation focusing on essential fields and types
function validateMinimalAiResponse(data) {
    if (!data || typeof data !== 'object') {
        console.warn('AI Response: Invalid data type:', typeof data);
        return false;
    }
    // Check for at least one numeric field to consider it potentially valid
    const numericFields = ['calories', 'protein', 'fat', 'carbs', 'weight'];
    const hasAtLeastOneNumber = numericFields.some(field => Object.prototype.hasOwnProperty.call(data, field) &&
        typeof data[field] === 'number' &&
        !isNaN(data[field]));
    if (!hasAtLeastOneNumber) {
        console.warn('AI Response: Does not contain any valid numeric nutrition fields.', data);
        return false;
    }
    // Check name if present
    if (Object.prototype.hasOwnProperty.call(data, 'name') && typeof data.name !== 'string') {
        console.warn('AI Response: Invalid name type:', typeof data.name);
        return false;
    }
    return true;
}
// API endpoint for meal analysis
const analyzeMealHandler = async (req, res) => {
    // Log entry into the handler
    console.log(`\n[${new Date().toISOString()}] >>> Entering analyzeMealHandler`);
    try {
        const { description } = req.body;
        console.log('Analyzing meal:', description);
        if (!description) {
            res.status(400).json({
                error: 'Description is required',
                message: 'Пожалуйста, введите название блюда'
            });
            return;
        }
        console.log('Making OpenAI request...');
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `Ты — эксперт по питательной ценности продуктов.

🎯 Твоя задача — рассчитать массу и КБЖУ (калории, белки, жиры, углеводы) на указанное блюдо или продукт.

📏 Правила определения массы (weight):

1. Если указан точный вес в граммах:
   "гречка 150 г" → weight = 150
   "рис 200г" → weight = 200

2. Если указано количество в штуках/порциях — оцени реальную массу:
   "3 яблока" → weight ≈ 450 (примерно 150г каждое)
   "2 куриных яйца" → weight ≈ 120 (примерно 60г каждое)
   "4 пельменя" → weight ≈ 60 (примерно 15г каждый)

3. Если указаны столовые приборы — используй стандартные меры:
   "столовая ложка масла" → weight ≈ 15-20
   "чайная ложка сахара" → weight ≈ 5-7

4. Если указана порция — используй типичный размер порции:
   "порция борща" → weight ≈ 300-350
   "тарелка риса" → weight ≈ 200-250
   "кусок пиццы" → weight ≈ 150-180

5. Если продукт указан без количества:
   - используй стандартную порцию 100г
   - укажи weight = 100

❗ Важно: всегда оценивай и возвращай массу в граммах в поле weight!

📦 Формат ответа (строго JSON):
{
  "weight": число,  // масса в граммах
  "calories": число,
  "protein": число,
  "fat": число,
  "carbs": число
}

📌 Примеры:
"гречка 150 г" →
{"weight": 150.0, "calories": 469.5, "protein": 18.9, "fat": 5.0, "carbs": 93.0}

"2 пельменя" →
{"weight": 30.0, "calories": 90.0, "protein": 5.0, "fat": 3.5, "carbs": 8.0}

"3 яблока" →
{"weight": 450.0, "calories": 234.0, "protein": 1.1, "fat": 0.7, "carbs": 57.2}

"столовая ложка масла" →
{"weight": 17.0, "calories": 153.0, "protein": 0.0, "fat": 17.0, "carbs": 0.0}

"банан" →
{"weight": 100.0, "calories": 89.0, "protein": 1.1, "fat": 0.3, "carbs": 22.8}

"блюдо неизвестное" →
{"weight": 0.0, "calories": 0.0, "protein": 0.0, "fat": 0.0, "carbs": 0.0}`
                    },
                    {
                        role: 'user',
                        content: description
                    }
                ],
                temperature: 0.1,
                response_format: { type: 'json_object' }
            });
            const content = response.choices?.[0]?.message?.content || '{}';
            console.log('Raw content from OpenAI:', content);
            let nutritionData;
            try {
                nutritionData = JSON.parse(content);
                console.log('Parsed nutrition data:', nutritionData);
                // Consider adding validation here if needed
                res.status(200).json(nutritionData);
            }
            catch (jsonError) {
                console.error('❌ Ошибка парсинга JSON от OpenAI:', jsonError);
                console.error('Ответ OpenAI, который не удалось распарсить:', content);
                res.status(500).json({ success: false, error: 'JSON parse error from AI response' });
                return;
            }
        }
        catch (openaiError) {
            console.error('❌ Ошибка вызова OpenAI API:', openaiError);
            // Log specific OpenAI error details
            if (typeof openaiError === 'object' && openaiError !== null) {
                if ('status' in openaiError)
                    console.error('--> OpenAI Error Status:', openaiError.status);
                if ('code' in openaiError)
                    console.error('--> OpenAI Error Code:', openaiError.code);
                if ('message' in openaiError)
                    console.error('--> OpenAI Error Message:', openaiError.message);
            }
            res.status(500).json({ success: false, error: 'OpenAI API call failed' });
            return;
        }
    }
    catch (error) {
        // This outer catch handles errors *before* the OpenAI call try block
        console.error('\n--- Error in meal analysis handler (PRE-API CALL) ---');
        // ... Keep the enhanced logging here ...
        console.error('Error Type:', typeof error);
        console.error('Error Name:', (error instanceof Error ? error.name : 'N/A'));
        console.error('Error Message:', (error instanceof Error ? error.message : 'N/A'));
        if (typeof error === 'object' && error !== null) {
            console.error('Error Properties (if any):', Object.keys(error));
            if ('status' in error)
                console.error('Error Status:', error.status);
            if ('code' in error)
                console.error('Error Code:', error.code);
            if ('error' in error && typeof error.error === 'object') {
                console.error('Nested Error Object:', JSON.stringify(error.error, null, 2));
            }
        }
        console.error('Raw Error Object:', error);
        try {
            console.error('Full Error Object (Stringified):', JSON.stringify(error, null, 2));
        }
        catch (stringifyError) {
            console.error('Could not stringify the full error object:', stringifyError);
        }
        if (error instanceof Error) {
            console.error('Error Stack:', error.stack);
        }
        res.status(500).json({
            success: false,
            error: 'An unexpected server error occurred before API analysis.'
        });
    }
};
router.post('/analyze-meal', analyzeMealHandler);
exports.default = router;
