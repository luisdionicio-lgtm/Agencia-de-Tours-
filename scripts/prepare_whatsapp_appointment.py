"""Prepara mensajes formales de cita para reservas pagadas de John Tours.

Este módulo no se conecta con WhatsApp ni envía mensajes. Solo valida los datos,
genera un código de separación estable y devuelve texto/URL para revisión humana.
"""

from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from datetime import date, datetime, time
from urllib.parse import quote


WHATSAPP_NUMBER = "51966779705"


@dataclass(frozen=True)
class AppointmentRequest:
    reservation_id: int
    customer_name: str
    tour_title: str
    destination: str
    travelers: int
    travel_date: date
    appointment_date: date
    appointment_time: time
    channel: str
    subject: str
    separation_amount: int = 200
    receipt_reference: str | None = None
    payment_confirmed: bool = True


def separation_code(reservation_id: int, year: int | None = None) -> str:
    if reservation_id <= 0:
        raise ValueError("El identificador de reserva debe ser positivo.")
    return f"JT-SEP-{str(reservation_id)[-6:].upper()}-{year or date.today().year}"


def validate(request: AppointmentRequest, today: date | None = None) -> None:
    current_date = today or date.today()
    if not request.payment_confirmed:
        raise ValueError("La cita solo puede prepararse después de validar la separación.")
    if request.reservation_id <= 0 or request.travelers <= 0:
        raise ValueError("La reserva y la cantidad de viajeros deben ser válidas.")
    if request.separation_amount <= 0:
        raise ValueError("El monto de separación debe ser mayor que cero.")
    if request.appointment_date < current_date:
        raise ValueError("La cita no puede programarse en una fecha pasada.")
    for field_name, value in (("cliente", request.customer_name), ("tour", request.tour_title), ("destino", request.destination), ("modalidad", request.channel), ("tema", request.subject)):
        if not value.strip():
            raise ValueError(f"El campo {field_name} es obligatorio.")
    if request.receipt_reference and not re.fullmatch(r"[A-Za-z0-9._-]{4,40}", request.receipt_reference):
        raise ValueError("La referencia de boleta contiene caracteres no permitidos.")


def build_message(request: AppointmentRequest) -> str:
    validate(request)
    code = separation_code(request.reservation_id)
    receipt_line = f"Referencia de boleta/comprobante: {request.receipt_reference}" if request.receipt_reference else "Boleta/comprobante: se adjuntará en este chat"
    return "\n".join(
        [
            "SOLICITUD DE CITA - JOHN TOURS PERÚ",
            "",
            f"Estimados, mi nombre es {request.customer_name.strip()}. Solicito coordinar una cita para revisar formalmente el paquete {request.tour_title.strip()}.",
            "",
            f"Código de separación: {code}",
            f"Reserva: #{request.reservation_id}",
            f"Destino: {request.destination.strip()}",
            f"Viajeros: {request.travelers}",
            f"Fecha de viaje: {request.travel_date.strftime('%d/%m/%Y')}",
            f"Monto de separación validado: S/ {request.separation_amount:.2f}",
            receipt_line,
            f"Cita solicitada: {request.appointment_date.strftime('%d/%m/%Y')} a las {request.appointment_time.strftime('%H:%M')}",
            f"Modalidad: {request.channel.strip()}",
            f"Tema principal: {request.subject.strip()}",
            "",
            "Agradezco confirmar la disponibilidad del asesor y las condiciones finales del paquete.",
            "",
            "Quedo atento(a). Muchas gracias.",
        ]
    )


def build_whatsapp_url(message: str, number: str = WHATSAPP_NUMBER) -> str:
    """Devuelve una URL con texto precargado; invocarla sigue sin enviar el mensaje."""
    digits = re.sub(r"\D", "", number)
    if len(digits) < 8:
        raise ValueError("El número de WhatsApp no es válido.")
    return f"https://wa.me/{digits}?text={quote(message)}"


def demo_request() -> AppointmentRequest:
    today = date.today()
    return AppointmentRequest(
        reservation_id=20260722,
        customer_name="Cliente de demostración",
        tour_title="Machu Picchu",
        destination="Cusco, Perú",
        travelers=2,
        travel_date=date(today.year + 1, 7, 15),
        appointment_date=today,
        appointment_time=time(10, 0),
        channel="Videollamada por WhatsApp",
        subject="Revisión del paquete, itinerario y saldo pendiente",
        receipt_reference="DEMO-BOLETA-001",
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Previsualiza un mensaje de cita sin enviarlo.")
    parser.add_argument("--show-url", action="store_true", help="Muestra también la URL de WhatsApp con texto precargado.")
    arguments = parser.parse_args()
    preview = build_message(demo_request())
    print("VISTA PREVIA - NO SE ENVÍA NINGÚN MENSAJE\n")
    print(preview)
    if arguments.show_url:
        print("\nURL PREPARADA (NO ABIERTA):\n" + build_whatsapp_url(preview))
