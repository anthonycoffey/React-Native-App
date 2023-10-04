import React, { useState, useEffect } from 'react';
import { Text } from '@rneui/themed';
import { useLocalSearchParams } from 'expo-router';

import api from '../../utils/api';

export function Job() {
  const params = useLocalSearchParams();
  const [job, setJob] = useState<{} | null>(null);

  // const fetchJob = () => {
  //   if (scope === 'active') {
  //     setSort('=arrivalTime');
  //   }

  //   api
  //     .get(`/jobs/mine?sortBy=${sort}&page=${page}&scope=${scope}`)
  //     .then(function (response) {
  //       const { data, meta } = response.data;

  //       setJobs(data);
  //     })
  //     .catch(function (error) {
  //       //todo: add error handling
  //       if (error.response) {
  //         // The request was made and the server responded with a status code
  //         // that falls out of the range of 2xx
  //         // console.log(error.response.data);
  //         // console.log(error.response.status);
  //         // console.log(error.response.headers);
  //       } else if (error.request) {
  //         // The request was made but no response was received
  //         // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
  //         // http.ClientRequest in node.js
  //         // console.log(error.request);
  //       } else {
  //         // Something happened in setting up the request that triggered an Error
  //         // console.log('Error', error.message);
  //       }
  //       // console.log(error.config);
  //     });
  // };

  // useEffect(() => {
  //   fetchJob();
  // }, []);

  return (
    <div>
      <Text h3>J-1234</Text>
      <Text>{params}</Text>
    </div>
  );
}
