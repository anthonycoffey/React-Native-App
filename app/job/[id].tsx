import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Text } from '@rneui/themed';
import { useLocalSearchParams } from 'expo-router';
import api from '../../utils/api';
import { Stack } from 'expo-router';
import { BaseEntity, Job } from '../../utils/types';

interface Job extends BaseEntity {

  status?: string;
}

// {
//  
//   
//   "paymentStatus": "pending-invoice",
//   "linkCode": null,
//   "arrivalTime": "2023-10-04T04:48:28.483Z",
//   "completedAt": null,
//   "canceledAt": null,
//   "createdAt": "2023-10-04T04:18:44.513Z",
//   "updatedAt": "2023-10-04T04:18:44.513Z",
//   "deletedAt": null,
//   "CarId": 8,
//   "CustomerId": 9,
//   "FormSubmissionId": null,
//   "dispatcherId": 190,
//   "assignedTechnicianId": 190,
//   "AddressId": 6350,
//   "Address": {
//       "short": "1300 E 4th St, Austin, TX 78702",
//       "id": 6350,
//       "address_1": "1300 E 4th St",
//       "address_2": "",
//       "city": "Austin",
//       "state": "TX",
//       "zipcode": 78702,
//       "lat": null,
//       "lng": null,
//       "createdAt": "2023-10-04T04:18:44.515Z",
//       "updatedAt": "2023-10-04T04:18:44.515Z"
//   },
//   "JobFiles": [],
//   "Car": {
//       "concat": "2023 grey Honda Accord ",
//       "id": 8,
//       "make": "Honda",
//       "model": "Accord",
//       "year": 2023,
//       "color": "grey",
//       "plate": "",
//       "vin": null,
//       "CustomerId": 9,
//       "createdAt": "2023-03-10T02:58:39.881Z",
//       "updatedAt": "2023-03-10T02:58:39.881Z"
//   },
//   "Payments": [],
//   "Invoices": [],
//   "Discounts": [],
//   "Payouts": [],
//   "JobComments": [],
//   "dispatcher": {
//       "fullName": "Tech Test",
//       "id": 190,
//       "firstName": "Tech",
//       "lastName": "Test",
//       "email": "tech@ax.bx",
//       "phone": "+17379324565",
//       "roles": [
//           "tech"
//       ],
//       "otp": null,
//       "otpExpiration": null,
//       "banned": false,
//       "isOnline": false,
//       "latitude": null,
//       "longitude": null,
//       "lastGeolocationUpdate": null,
//       "darkMode": false,
//       "createdAt": "2023-10-04T04:02:51.805Z",
//       "updatedAt": "2023-10-04T04:02:51.805Z",
//       "deletedAt": null
//   },
//   "assignedTechnician": {
//       "fullName": "Tech Test",
//       "id": 190,
//       "firstName": "Tech",
//       "lastName": "Test",
//       "email": "tech@ax.bx",
//       "phone": "+17379324565",
//       "roles": [
//           "tech"
//       ],
//       "otp": null,
//       "otpExpiration": null,
//       "banned": false,
//       "isOnline": false,
//       "latitude": null,
//       "longitude": null,
//       "lastGeolocationUpdate": null,
//       "darkMode": false,
//       "createdAt": "2023-10-04T04:02:51.805Z",
//       "updatedAt": "2023-10-04T04:02:51.805Z",
//       "deletedAt": null
//   },
//   "Customer": {
//       "fullName": "Robert Ramirez",
//       "concat": "Robert Ramirez",
//       "id": 9,
//       "firstName": "Robert",
//       "lastName": "Ramirez",
//       "email": "",
//       "createdAt": "2023-03-05T18:32:52.165Z",
//       "updatedAt": "2023-03-05T18:32:52.178Z",
//       "defaultPhoneId": 1,
//       "CustomerPhones": [
//           {
//               "id": 1,
//               "number": "+17373446380",
//               "note": null,
//               "createdAt": "2023-03-05T18:32:52.170Z",
//               "updatedAt": "2023-03-05T18:32:52.170Z",
//               "CustomerId": 9
//           },
//           {
//               "id": 9,
//               "number": "+17814394277",
//               "note": "",
//               "createdAt": "2023-03-10T03:04:25.274Z",
//               "updatedAt": "2023-03-10T03:04:25.274Z",
//               "CustomerId": 9
//           }
//       ],
//       "defaultPhone": {
//           "id": 1,
//           "number": "+17373446380",
//           "note": null,
//           "createdAt": "2023-03-05T18:32:52.170Z",
//           "updatedAt": "2023-03-05T18:32:52.170Z",
//           "CustomerId": 9
//       }
//   },
//   "JobLineItems": [
//       {
//           "id": 28765,
//           "price": 3495,
//           "createdAt": "2023-10-04T04:18:44.535Z",
//           "updatedAt": "2023-10-04T04:18:44.535Z",
//           "JobId": 6350,
//           "ServiceId": 2,
//           "Service": {
//               "id": 2,
//               "name": " Standard Service Call Fee",
//               "description": "Basic Standard fee associated with dispatching a Technician to assist with any service we provide. ",
//               "payoutRate": 38,
//               "payoutMinimum": 0,
//               "price": 3495,
//               "isDefault": true,
//               "isInternal": false,
//               "createdAt": "2022-09-08T00:40:02.801Z",
//               "updatedAt": "2023-06-24T00:24:33.596Z",
//               "deletedAt": null
//           }
//       }
//   ],
//   "JobActions": [
//       {
//           "id": 41594,
//           "action": "Created job and assigned to themself",
//           "createdAt": "2023-10-04T04:18:45.053Z",
//           "updatedAt": "2023-10-04T04:18:45.053Z",
//           "JobId": 6350,
//           "UserId": 190,
//           "User": {
//               "fullName": "Tech Test",
//               "id": 190,
//               "firstName": "Tech",
//               "lastName": "Test",
//               "email": "tech@ax.bx",
//               "phone": "+17379324565",
//               "roles": [
//                   "tech"
//               ],
//               "otp": null,
//               "otpExpiration": null,
//               "banned": false,
//               "isOnline": false,
//               "latitude": null,
//               "longitude": null,
//               "lastGeolocationUpdate": null,
//               "darkMode": false,
//               "createdAt": "2023-10-04T04:02:51.805Z",
//               "updatedAt": "2023-10-04T04:02:51.805Z",
//               "deletedAt": null
//           }
//       }
//   ],
//   "proxy": {
//       "id": 6859,
//       "active": true,
//       "createdAt": "2023-10-04T04:18:44.558Z",
//       "updatedAt": "2023-10-04T04:18:44.558Z",
//       "JobId": 6350,
//       "UserId": 190,
//       "CustomerId": 9,
//       "ProxyNumberId": 1,
//       "CustomerPhoneId": 1,
//       "ProxyNumber": {
//           "id": 1,
//           "inUse": true,
//           "sid": "PNf7a367cfd27460e2b9617a137e483037",
//           "number": "+15126686340",
//           "createdAt": "2023-02-11T18:24:45.175Z",
//           "updatedAt": "2023-10-04T04:18:44.567Z",
//           "ProxySessionId": 6859
//       },
//       "CustomerPhone": {
//           "id": 1,
//           "number": "+17373446380",
//           "note": null,
//           "createdAt": "2023-03-05T18:32:52.170Z",
//           "updatedAt": "2023-03-05T18:32:52.170Z",
//           "CustomerId": 9
//       },
//       "User": {
//           "fullName": "Tech Test",
//           "id": 190,
//           "firstName": "Tech",
//           "lastName": "Test",
//           "email": "tech@ax.bx",
//           "phone": "+17379324565",
//           "roles": [
//               "tech"
//           ],
//           "otp": null,
//           "otpExpiration": null,
//           "banned": false,
//           "isOnline": false,
//           "latitude": null,
//           "longitude": null,
//           "lastGeolocationUpdate": null,
//           "darkMode": false,
//           "createdAt": "2023-10-04T04:02:51.805Z",
//           "updatedAt": "2023-10-04T04:02:51.805Z",
//           "deletedAt": null
//       }
//   }
// }

export default function Job() {
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState<{} | null>(null);

  const fetchJob = () => {
    console.log('id', id);

    api
      .get(`/jobs/${id}`)
      .then(function (response) {
        const { data } = response;
        console.log('data', data);
        setJob(data);
      })
      .catch(function (error) {
        //todo: add error handling
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
        console.log(error.config);
      });
  };
  useEffect(() => {
    fetchJob();
  }, [id]);

  return (
    <>
      <View>
        <Text h3>Job {id}</Text>
      </View>
    </>
  );
}
