import { Client } from '@elastic/elasticsearch';
import { env } from './env';

const elasticConfig = {
    node: env.ELASTIC_NODE || 'http://localhost:9200',
    auth: env.ELASTIC_USER && env.ELASTIC_PASS ? {
        username: env.ELASTIC_USER,
        password: env.ELASTIC_PASS,
    } : undefined,
    maxRetries: 3,
    requestTimeout: 10000,
    sniffOnStart: true,
    tls: env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false,
    } : undefined,
};

export const elasticClient = new Client(elasticConfig);

// Test connection
export const testElasticConnection = async (): Promise<boolean> => {
    try {
        await elasticClient.ping();
        return true;
    } catch (error) {
        console.warn('Elasticsearch connection failed:', error);
        return false;
    }
};
