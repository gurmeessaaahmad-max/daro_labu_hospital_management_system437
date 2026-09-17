import requests

patient = {
    "patient_number": "DLH-0003",
    "first_name": "Mohammed",
    "middle_name": "Ali",
    "last_name": "Hassan",
    "date_of_birth": "1998-08-10",
    "gender": "Male",
    "phone": "0933000000",
    "email": "mohammed@gmail.com",
    "address": "Daro Labu",
    "blood_group": "B+",
    "marital_status": "Single"
}

response = requests.post(
    "http://127.0.0.1:5000/api/patients",
    json=patient
)

print("Status:", response.status_code)
print("Response:")
print(response.json())