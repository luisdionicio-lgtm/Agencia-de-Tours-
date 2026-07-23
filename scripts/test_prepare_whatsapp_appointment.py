import unittest
from dataclasses import replace
from datetime import date, timedelta

from prepare_whatsapp_appointment import build_message, demo_request, separation_code, validate


class AppointmentMessageTests(unittest.TestCase):
    def test_message_contains_professional_payment_references(self):
        request = demo_request()
        message = build_message(request)
        self.assertIn(separation_code(request.reservation_id), message)
        self.assertIn("Referencia de boleta/comprobante", message)
        self.assertIn("Monto de separación validado", message)

    def test_rejects_unconfirmed_payment(self):
        with self.assertRaisesRegex(ValueError, "después de validar"):
            validate(replace(demo_request(), payment_confirmed=False))

    def test_rejects_past_appointment(self):
        request = replace(demo_request(), appointment_date=date.today() - timedelta(days=1))
        with self.assertRaisesRegex(ValueError, "fecha pasada"):
            validate(request)


if __name__ == "__main__":
    unittest.main()
