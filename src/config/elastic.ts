import { Client } from '@elastic/elasticsearch';

export const elasticClient = new Client({
    node: process.env.ELASTIC_NODE || 'http://localhost:9200',
    auth: {
        username: process.env.ELASTIC_USER || 'elastic',
        password: process.env.ELASTIC_PASS || 'changeme',
    },
});
