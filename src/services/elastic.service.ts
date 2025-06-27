import { config } from "../config";

export const indexProduct = async (product: any) => {
    await config.elasticClient.index({
        index: 'products',
        id: product._id.toString(),
        document: {
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            slug: product.slug,
            thumbnail: product.thumbnail,
        },
    });
};

export const searchProducts = async (query: string) => {
    const result = await config.elasticClient.search({
        index: 'products',
        query: {
            multi_match: {
                query,
                fields: ['name^3', 'description', 'slug'],
                fuzziness: 'auto', // enables typo tolerance
            },
        },
    });
    console.log('Elastic Search Result:', result);
    return result.hits.hits.map(hit => hit._source);
};
