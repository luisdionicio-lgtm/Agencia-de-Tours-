from __future__ import annotations

import io
import shutil
import urllib.request
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from PIL import Image as PILImage


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf"
PUBLIC = ROOT / "frontend" / "public"
LOGO = PUBLIC / "john-tours-logo-cropped.png"

GUIDES = {
    "cusco": {
        "title": "Cusco y Machu Picchu",
        "subtitle": "Complementos sugeridos para vivir la experiencia con mayor comodidad",
        "image": "https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=1600&q=88",
        "extras": [
            ("Traslado privado", "Recojo coordinado desde el aeropuerto o terminal hacia el alojamiento."),
            ("Noche adicional", "Alternativa de alojamiento antes o después del programa reservado."),
            ("Almuerzo regional", "Selección de sabores cusqueños en un establecimiento recomendado."),
            ("Asistencia de altura", "Orientación preventiva, seguimiento y kit básico de aclimatación."),
            ("Sesión fotográfica", "Registro referencial de la experiencia en un punto acordado."),
            ("Seguro de viaje", "Opción de cobertura según edad, fechas y condiciones del pasajero."),
        ],
    },
    "orlando": {
        "title": "Disney Orlando",
        "subtitle": "Opciones adicionales para una estadía familiar más simple",
        "image": "https://images.unsplash.com/photo-1597466599360-3b9775841aec?auto=format&fit=crop&w=1600&q=88",
        "extras": [("Traslado aeropuerto-hotel", "Servicio coordinado de llegada o salida."), ("Equipaje adicional", "Asistencia para cotizar maletas según la aerolínea."), ("Seguro internacional", "Cobertura opcional para las fechas del viaje."), ("Día de compras", "Traslado programado a un centro comercial u outlet."), ("Datos móviles", "Alternativas de eSIM para mantener al grupo conectado."), ("Asistencia en español", "Coordinación remota durante la estadía.")],
    },
    "oxapampa": {
        "title": "Oxapampa",
        "subtitle": "Complementos para disfrutar naturaleza, cultura y descanso",
        "image": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=88",
        "extras": [("Traslado privado", "Movilidad exclusiva en horarios coordinados."), ("Noche adicional", "Extensión de alojamiento sujeta a disponibilidad."), ("Experiencia de café", "Visita guiada y degustación en un productor local."), ("Alimentación", "Opciones de desayunos, almuerzos o cenas."), ("Fotografía", "Sesión referencial en un entorno natural."), ("Seguro de viaje", "Cobertura opcional durante la ruta.")],
    },
    "ica": {
        "title": "Ica y Huacachina",
        "subtitle": "Servicios opcionales para personalizar la escapada",
        "image": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=88",
        "extras": [("Traslado privado", "Recojo y retorno en un punto coordinado."), ("Noche adicional", "Extensión de alojamiento en Ica o Huacachina."), ("Experiencia gastronómica", "Reserva de almuerzo o cena regional."), ("Bodega seleccionada", "Visita y degustación según disponibilidad."), ("Fotografía al atardecer", "Registro referencial en las dunas."), ("Seguro de viaje", "Cobertura opcional para la duración del viaje.")],
    },
    "egipto": {
        "title": "Egipto",
        "subtitle": "Complementos para una experiencia internacional más cómoda",
        "image": "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1600&q=88",
        "extras": [("Traslado privado", "Recepción coordinada entre aeropuerto y hotel."), ("Equipaje adicional", "Asistencia de cotización según aerolínea."), ("Seguro internacional", "Cobertura opcional según perfil y fechas."), ("Datos móviles", "Alternativas de conectividad durante el viaje."), ("Comidas seleccionadas", "Opciones gastronómicas adicionales."), ("Asistencia en español", "Soporte remoto para coordinaciones del pasajero.")],
    },
    "general": {
        "title": "Tu próxima experiencia",
        "subtitle": "Servicios adicionales disponibles después de confirmar tu reserva",
        "image": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=88",
        "extras": [("Traslados", "Opciones privadas o compartidas según el destino."), ("Alojamiento", "Noches adicionales sujetas a disponibilidad."), ("Alimentación", "Alternativas para complementar el paquete."), ("Equipaje", "Asistencia según las reglas del transportista."), ("Seguro de viaje", "Cobertura opcional para el pasajero."), ("Asistencia", "Acompañamiento antes y durante el viaje.")],
    },
}


def fetch_image(url: str) -> io.BytesIO:
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        raw = response.read()
    image = PILImage.open(io.BytesIO(raw)).convert("RGB")
    image.thumbnail((1500, 900))
    output = io.BytesIO()
    image.save(output, "JPEG", quality=88, optimize=True)
    output.seek(0)
    return output


def footer(canvas: Canvas, doc: SimpleDocTemplate) -> None:
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#DCE7EF"))
    canvas.line(1.6 * cm, 1.35 * cm, 19.4 * cm, 1.35 * cm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#64748B"))
    canvas.drawString(1.6 * cm, 0.92 * cm, "John Tours Perú · Guía exclusiva posterior a la reserva")
    canvas.drawRightString(19.4 * cm, 0.92 * cm, f"Página {doc.page}")
    canvas.restoreState()


def create_guide(key: str, guide: dict) -> Path:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    filename = "servicios-adicionales-john-tours.pdf" if key == "general" else f"guia-extras-{key}-john-tours.pdf"
    target = OUTPUT / filename
    doc = SimpleDocTemplate(str(target), pagesize=A4, rightMargin=1.6 * cm, leftMargin=1.6 * cm, topMargin=1.35 * cm, bottomMargin=1.8 * cm)
    styles = getSampleStyleSheet()
    title = ParagraphStyle("TitleBrand", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=24, leading=28, textColor=colors.HexColor("#082447"), spaceAfter=5)
    subtitle = ParagraphStyle("Subtitle", parent=styles["BodyText"], fontSize=10.5, leading=15, textColor=colors.HexColor("#52677B"), alignment=TA_CENTER)
    card_title = ParagraphStyle("CardTitle", parent=styles["Heading3"], fontSize=11, leading=14, textColor=colors.HexColor("#082447"), spaceAfter=4)
    card_body = ParagraphStyle("CardBody", parent=styles["BodyText"], fontSize=8.5, leading=12, textColor=colors.HexColor("#52677B"))
    body = ParagraphStyle("Body", parent=styles["BodyText"], fontSize=9.5, leading=14, textColor=colors.HexColor("#52677B"))

    logo = Image(str(LOGO), width=5.2 * cm, height=1.65 * cm)
    logo.hAlign = "CENTER"
    hero_data = fetch_image(guide["image"])
    hero = Image(hero_data, width=17.8 * cm, height=7.2 * cm)
    hero.hAlign = "CENTER"

    story = [logo, Spacer(1, 0.25 * cm), Paragraph(guide["title"], title), Paragraph(guide["subtitle"], subtitle), Spacer(1, 0.45 * cm), hero, Spacer(1, 0.45 * cm)]
    notice = Table([[Paragraph("CONTENIDO DESBLOQUEADO", card_title), Paragraph("Esta guía se entrega únicamente después de validar el pago de reserva. Los servicios son opcionales, se cotizan por separado y están sujetos a disponibilidad.", body)]], colWidths=[5.1 * cm, 12.3 * cm])
    notice.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#EEF8F4")), ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#B8DFCF")), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12), ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10)]))
    story += [notice, Spacer(1, 0.45 * cm), Paragraph("Extras que puedes solicitar", ParagraphStyle("Section", parent=title, fontSize=17, leading=21, spaceAfter=9))]

    rows = []
    for index in range(0, len(guide["extras"]), 2):
        cells = []
        for name, description in guide["extras"][index:index + 2]:
            cells.append([Paragraph(name, card_title), Paragraph(description, card_body)])
        rows.append(cells)
    cards = Table(rows, colWidths=[8.65 * cm, 8.65 * cm], hAlign="CENTER")
    cards.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FBFD")), ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor("#DCE7EF")), ("INNERGRID", (0, 0), (-1, -1), 0.7, colors.HexColor("#DCE7EF")), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12), ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10)]))
    story += [cards, Spacer(1, 0.45 * cm), Paragraph("¿Deseas agregar alguno? Escríbenos al WhatsApp +51 966 779 705 indicando tu código de reserva. Un asesor confirmará precio, condiciones y disponibilidad antes de realizar cualquier cobro adicional.", body)]
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    shutil.copy2(target, PUBLIC / filename)
    return target


if __name__ == "__main__":
    for guide_key, guide_data in GUIDES.items():
        print(create_guide(guide_key, guide_data))
