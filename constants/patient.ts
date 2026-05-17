export const patientFields = [
    { label: 'Name', key: 'name' },
    { label: 'Caregiver Name', key: 'caregiverName' },
    { label: 'Phone Number(s)', key: 'phoneNumber' }, // array<string>
    { label: 'Sex', key: 'sex' },
    { label: 'Date of Birth', key: 'dob' },
    { label: 'Address', key: 'address' },
    { label: 'Religion', key: 'religion' },
    { label: 'Aadhaar ID', key: 'aadhaarId' },
    { label: 'Ration Card Color', key: 'rationCardColor' },
    { label: 'Diseases', key: 'diseases' }, // array<string>
    { label: 'Assigned Hospital', key: 'assignedHospital' }, // object {id, name}
    { label: 'Assigned Asha', key: 'assignedAsha' },
    { label: 'GPS Location', key: 'gpsLocation' }, // object {lat, lng}
    //   { label: "Follow Ups", key: "followUps" }, // array<object>
    { label: 'Patient Status', key: 'patientStatus' },
    { label: 'Treatment Status', key: 'treatmentStatus' },
    { label: 'Aabha ID', key: 'aabhaId' },
    { label: 'Diagnosed Date', key: 'diagnosedDate' },
    { label: 'Diagnosed Years Ago', key: 'diagnosedYearsAgo' },
    { label: 'Hospital Registration Date', key: 'hospitalRegistrationDate' },
    { label: 'Treatment Start Date', key: 'treatmentStartDate' },
    { label: 'Treatment End Date', key: 'treatmentEndDate' },
    { label: 'Biopsy Number', key: 'biopsyNumber' },
    { label: 'Transferred', key: 'transferred' },
    { label: 'Transferred From', key: 'transferredFrom' },
    { label: 'Has Aadhaar', key: 'hasAadhaar' },
    { label: 'Suspected Case', key: 'suspectedCase' },
    { label: 'HBCR ID', key: 'hbcrID' },
    { label: 'Hospital Registration ID', key: 'hospitalRegistrationId' },
    { label: 'Stage of the Cancer', key: 'stageOfTheCancer' },
    //   { label: 'Reason of Removal', key: 'reasonOfRemoval' },
    { label: 'Treatment Details', key: 'treatmentDetails' },
    //   { label: 'Other Treatment Details', key: 'otherTreatmentDetails' },
    { label: 'Insurance', key: 'insurance' }, // object {type, id}
]
