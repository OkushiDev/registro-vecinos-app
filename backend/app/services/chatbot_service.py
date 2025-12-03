import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class ChatbotService:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # Mapeo de intents
        self.intents = {
            0: "SOLICITAR_CERTIFICADO",
            1: "CONSULTAR_ESTADO",
            2: "PREGUNTAR_HORARIO",
        }

        # Respuestas predefinidas
        self.respuestas = {
            "SOLICITAR_CERTIFICADO": "Para solicitar un certificado de residencia, ve al menú 'Mis Documentos' > 'Solicitar Certificado'. El presidente será notificado y procesará tu solicitud.",
            "CONSULTAR_ESTADO": "Puedes consultar tu estado de socio en el menú 'Mi Perfil'. Allí verás tu número de socio y estado actual.",
            "PREGUNTAR_HORARIO": "La junta de vecinos atiende de Lunes a Viernes, de 9:00 AM a 6:00 PM. Los sábados de 10:00 AM a 2:00 PM.",
        }

        self.load_model()

    def load_model(self):
        """Carga el modelo entrenado"""
        try:
            model_path = Path(__file__).parent.parent / "ml_models" / "chatbot"

            if not model_path.exists():
                logger.warning(
                    f"Modelo no encontrado en {model_path}. Usando respuestas por defecto."
                )
                return

            self.tokenizer = AutoTokenizer.from_pretrained(str(model_path))
            self.model = AutoModelForSequenceClassification.from_pretrained(
                str(model_path)
            )
            self.model.to(self.device)
            self.model.eval()

            logger.info(f"Modelo cargado exitosamente desde {model_path}")
            logger.info(f"Dispositivo: {self.device}")

        except Exception as e:
            logger.error(f"Error al cargar modelo: {e}")
            self.model = None
            self.tokenizer = None

    def predecir_intent(self, texto: str) -> tuple[str, float]:
        """
        Predice el intent de un texto.
        Retorna (intent_nombre, confianza)
        """
        if not self.model or not self.tokenizer:
            return "UNKNOWN", 0.0

        try:
            # Tokenizar
            inputs = self.tokenizer(
                texto,
                padding=True,
                truncation=True,
                max_length=128,
                return_tensors="pt",
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            # Predicción
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits

            # Obtener la clase con mayor probabilidad
            probabilities = torch.softmax(logits, dim=1)
            predicted_class = torch.argmax(probabilities, dim=1).item()
            confidence = probabilities[0][predicted_class].item()

            intent_name = self.intents.get(predicted_class, "UNKNOWN")

            logger.info(
                f"Texto: '{texto}' → Intent: {intent_name} (Confianza: {confidence:.2%})"
            )

            return intent_name, confidence

        except Exception as e:
            logger.error(f"Error en predicción: {e}")
            return "UNKNOWN", 0.0

    def obtener_respuesta(self, texto: str) -> dict:
        """
        Procesa un mensaje y retorna la respuesta del chatbot
        """
        intent, confianza = self.predecir_intent(texto)

        # Si la confianza es baja, respuesta genérica
        if confianza < 0.5:
            return {
                "respuesta": "Lo siento, no entendí tu pregunta. ¿Podrías reformularla? También puedes contactar directamente al presidente.",
                "intent": "UNKNOWN",
                "confianza": confianza,
            }

        respuesta = self.respuestas.get(intent, "No tengo una respuesta para eso.")

        return {"respuesta": respuesta, "intent": intent, "confianza": confianza}


# Instancia global del servicio
chatbot_service = ChatbotService()
