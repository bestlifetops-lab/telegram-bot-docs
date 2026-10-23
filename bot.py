import os
import logging
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# إعداد السجلات (Logging) للمتابعة
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

# أمر البداية /start
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_name = update.effective_user.first_name
    welcome_message = f"أهلاً بك يا {user_name}! 👋\nأنا بوتك الذكي الجديد، جاهز لمساعدتك."
    await update.message.reply_text(welcome_message)

# أمر المساعدة /help
async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text("أرسل لي أي رسالة وسأقوم بالرد عليك تلقائياً!")

# الرد على الرسائل النصية
async def echo(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_text = update.message.text
    response_text = f"وصلتني رسالتك: {user_text}"
    await update.message.reply_text(response_text)

def main():
    # قراءة التوكن من المتغيرات البيئية (Environment Variables)
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    
    if not token:
        print("خطأ: لم يتم العثور على TELEGRAM_BOT_TOKEN!")
        return

    # إنشاء تطبيق البوت
    application = Application.builder().token(token).build()

    # تسجيل الأوامر والوظائف
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))

    # تشغيل البوت
    print("البوت يعمل الآن...")
    application.run_polling()

if __name__ == '__main__':
    main()
