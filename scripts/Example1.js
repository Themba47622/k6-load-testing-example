import http from 'k6/http';
import { check } from 'k6';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

export const options = {
    stages: [
        { target: 5, duration: '1m' },
        { target: 5, duration: '2m' },
        { target: 0, duration: '1m' },
    ],
    thresholds: {
        "http_req_duration": ["p(95)<1000"]
    },
};

const csvData = papaparse.parse(open('./crocodiles.csv'), { header: true }).data;

export default function () {

    let randomUser = csvData[Math.floor(Math.random() * csvData.length)];
    console.log('Random user: ', JSON.stringify(randomUser));

    let requests = {
        'public/crocodiles': {
            method: 'GET',
            url: 'https://test-api.k6.io/public/crocodiles/'
        },
        'public/crocodiles/${Id}': {
            method: 'GET',
            url: 'https://test-api.k6.io/public/crocodiles/' + randomUser.Id,
            params: {
                headers: {
                    Authorization: randomUser.sessionId,
                    'x-profile-id': randomUser.profileId,
                    'Content-Type': 'application/json',
                }
            },
        }
    };
    let responses = http.batch(requests);

    check(responses['public/crocodiles'], {
        'public/crocodiles status was 200': (res) => res.status === 200,
    });

    check(responses['public/crocodiles/${Id}'], {
        'public/crocodiles/${Id} status was 200': (res) => res.status === 200,
    });
  
}