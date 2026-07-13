#!/bin/bash

# UPDATE NEW EMPLOYEE PAGE
sed -i '/<div className="form-control">/i\
          <div className="form-control">\
            <label className="label">\
              <span className="label-text">ID Card (KTP)</span>\
            </label>\
            <input type="text" name="idCardNumber" className="input input-bordered w-full" placeholder="KTP Number" />\
          </div>\
          <div className="form-control">\
            <label className="label">\
              <span className="label-text">Birth Place</span>\
            </label>\
            <input type="text" name="birthPlace" className="input input-bordered w-full" placeholder="e.g. Jakarta" />\
          </div>\
          <div className="form-control">\
            <label className="label">\
              <span className="label-text">Birth Date</span>\
            </label>\
            <input type="date" name="birthDate" className="input input-bordered w-full" />\
          </div>\
          <div className="form-control">\
            <label className="label">\
              <span className="label-text">Gender</span>\
            </label>\
            <select name="gender" className="select select-bordered w-full">\
              <option value="">-- Select Gender --</option>\
              <option value="MALE">Male</option>\
              <option value="FEMALE">Female</option>\
            </select>\
          </div>' src/app/dashboard/employees/new/page.tsx

# UPDATE EDIT EMPLOYEE PAGE
sed -i '/<div className="form-control">/i\
          <div className="form-control">\
            <label className="label">\
              <span className="label-text">ID Card (KTP)</span>\
            </label>\
            <input type="text" name="idCardNumber" className="input input-bordered w-full" defaultValue={employee.idCardNumber || ""} />\
          </div>\
          <div className="form-control">\
            <label className="label">\
              <span className="label-text">Birth Place</span>\
            </label>\
            <input type="text" name="birthPlace" className="input input-bordered w-full" defaultValue={employee.birthPlace || ""} />\
          </div>\
          <div className="form-control">\
            <label className="label">\
              <span className="label-text">Birth Date</span>\
            </label>\
            <input type="date" name="birthDate" className="input input-bordered w-full" defaultValue={employee.birthDate ? employee.birthDate.toISOString().split('\''T'\'')[0] : ""} />\
          </div>\
          <div className="form-control">\
            <label className="label">\
              <span className="label-text">Gender</span>\
            </label>\
            <select name="gender" className="select select-bordered w-full" defaultValue={employee.gender || ""}>\
              <option value="">-- Select Gender --</option>\
              <option value="MALE">Male</option>\
              <option value="FEMALE">Female</option>\
            </select>\
          </div>' src/app/dashboard/employees/\[id\]/edit/page.tsx

# FIX UPDATE ACTIONS
sed -i '/const endContract = formData.get("endContract") as string/i\
  const idCardNumber = formData.get("idCardNumber") as string\
  const birthPlace = formData.get("birthPlace") as string\
  const birthDateStr = formData.get("birthDate") as string\
  const gender = formData.get("gender") as string\
' src/app/dashboard/employees/actions.ts

sed -i '/endContract: endContract ? new Date(endContract) : null,/i\
        idCardNumber: idCardNumber || null,\
        birthPlace: birthPlace || null,\
        birthDate: birthDateStr ? new Date(birthDateStr) : null,\
        gender: gender || null,' src/app/dashboard/employees/actions.ts

