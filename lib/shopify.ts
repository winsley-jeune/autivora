import {
  Cart,
  Connection,
  Product,
} from './shopify-types';

// Normalize the store domain: tolerate https:// prefix or trailing slash
// so a misconfigured Vercel env var doesn't silently break product fetches.
const rawDomain = process.env.SHOPIFY_STORE_DOMAIN;
const domain = rawDomain?.replace(/^https?:\/\//, '').replace(/\/$/, '');
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION = '2024-01';

async function shopifyFetch<T>({
  query,
  variables,
  headers,
  cache = 'force-cache',
}: {
  query: string;
  variables?: any;
  headers?: any;
  cache?: RequestCache;
}): Promise<{ status: number; body: T } | never> {
  if (!domain || !storefrontAccessToken) {
    throw new Error('Missing Shopify environment variables');
  }

  try {
    const result = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
        ...headers,
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables }),
      }),
      cache,
      next: { revalidate: 900 }, // 15 minutes
    });

    const body = await result.json();

    if (body.errors) {
      throw body.errors[0];
    }

    return {
      status: result.status,
      body,
    };
  } catch (e) {
    throw {
      error: e,
      query,
    };
  }
}

const reshapeCart = (cart: any): Cart => {
  if (!cart.cost?.totalTaxAmount) {
    cart.cost.totalTaxAmount = {
      amount: '0.0',
      currencyCode: 'USD',
    };
  }
  return {
    ...cart,
    lines: {
      edges: cart.lines.edges.map((item: any) => ({
        ...item,
        node: {
          ...item.node,
          merchandise: {
            ...item.node.merchandise,
            product: {
              ...item.node.merchandise.product,
              title: item.node.merchandise.product.title, // Ensure title exists
            }
          }
        }
      })),
    },
  };
};

export async function createCart(): Promise<Cart> {
  const res = await shopifyFetch<any>({
    query: `
      mutation cartCreate {
        cartCreate {
          cart {
            id
            checkoutUrl
            cost {
              subtotalAmount {
                amount
                currencyCode
              }
              totalAmount {
                amount
                currencyCode
              }
              totalTaxAmount {
                amount
                currencyCode
              }
            }
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  cost {
                    totalAmount {
                      amount
                      currencyCode
                    }
                  }
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      selectedOptions {
                        name
                        value
                      }
                      product {
                        id
                        handle
                        title
                        featuredImage {
                          url
                          altText
                          width
                          height
                        }
                      }
                    }
                  }
                }
              }
            }
            totalQuantity
          }
        }
      }
    `,
    cache: 'no-store',
  });

  return reshapeCart(res.body.data.cartCreate.cart);
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number; sellingPlanId?: string }[]
): Promise<Cart> {
  const res = await shopifyFetch<any>({
    query: `
      mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            cost {
              subtotalAmount {
                amount
                currencyCode
              }
              totalAmount {
                amount
                currencyCode
              }
              totalTaxAmount {
                amount
                currencyCode
              }
            }
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  cost {
                    totalAmount {
                      amount
                      currencyCode
                    }
                  }
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      selectedOptions {
                        name
                        value
                      }
                      product {
                        id
                        handle
                        title
                        featuredImage {
                          url
                          altText
                          width
                          height
                        }
                      }
                    }
                  }
                }
              }
            }
            totalQuantity
          }
        }
      }
    `,
    variables: {
      cartId,
      lines,
    },
    cache: 'no-store',
  });

  return reshapeCart(res.body.data.cartLinesAdd.cart);
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
  const res = await shopifyFetch<any>({
    query: `
      mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id
            checkoutUrl
            cost {
              subtotalAmount {
                amount
                currencyCode
              }
              totalAmount {
                amount
                currencyCode
              }
              totalTaxAmount {
                amount
                currencyCode
              }
            }
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  cost {
                    totalAmount {
                      amount
                      currencyCode
                    }
                  }
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      selectedOptions {
                        name
                        value
                      }
                      product {
                        id
                        handle
                        title
                        featuredImage {
                          url
                          altText
                          width
                          height
                        }
                      }
                    }
                  }
                }
              }
            }
            totalQuantity
          }
        }
      }
    `,
    variables: {
      cartId,
      lineIds,
    },
    cache: 'no-store',
  });

  return reshapeCart(res.body.data.cartLinesRemove.cart);
}

export async function updateCart(
  cartId: string,
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const res = await shopifyFetch<any>({
    query: `
      mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            cost {
              subtotalAmount {
                amount
                currencyCode
              }
              totalAmount {
                amount
                currencyCode
              }
              totalTaxAmount {
                amount
                currencyCode
              }
            }
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  cost {
                    totalAmount {
                      amount
                      currencyCode
                    }
                  }
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      selectedOptions {
                        name
                        value
                      }
                      product {
                        id
                        handle
                        title
                        featuredImage {
                          url
                          altText
                          width
                          height
                        }
                      }
                    }
                  }
                }
              }
            }
            totalQuantity
          }
        }
      }
    `,
    variables: {
      cartId,
      lines,
    },
    cache: 'no-store',
  });

  return reshapeCart(res.body.data.cartLinesUpdate.cart);
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const res = await shopifyFetch<any>({
    query: `
      query getCart($cartId: ID!) {
        cart(id: $cartId) {
          id
          checkoutUrl
          cost {
            subtotalAmount {
              amount
              currencyCode
            }
            totalAmount {
              amount
              currencyCode
            }
            totalTaxAmount {
              amount
              currencyCode
            }
          }
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                cost {
                  totalAmount {
                    amount
                    currencyCode
                  }
                }
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    selectedOptions {
                      name
                      value
                    }
                    product {
                      id
                      handle
                      title
                      featuredImage {
                        url
                        altText
                        width
                        height
                      }
                    }
                  }
                }
              }
            }
          }
          totalQuantity
        }
      }
    `,
    variables: { cartId },
    cache: 'no-store',
  });

  if (!res.body.data.cart) {
    return null;
  }

  return reshapeCart(res.body.data.cart);
}

export async function getProduct(handle: string): Promise<Product | null> {
  try {
  const res = await shopifyFetch<any>({
    query: `
      query getProduct($handle: String!) {
        product(handle: $handle) {
          id
          handle
          availableForSale
          title
          description
          descriptionHtml
          options {
            id
            name
            values
          }
          priceRange {
            maxVariantPrice {
              amount
              currencyCode
            }
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 250) {
            edges {
              node {
                id
                title
                availableForSale
                selectedOptions {
                  name
                  value
                }
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
          featuredImage {
            url
            altText
            width
            height
          }
          images(first: 20) {
            edges {
              node {
                url
                altText
                width
                height
              }
            }
          }
          seo {
            title
            description
          }
          tags
          updatedAt
        }
      }
    `,
    variables: {
      handle,
    },
  });

  return res.body.data.product ?? null;
  } catch (e) {
    console.error('[Shopify] getProduct failed for handle:', handle, e);
    return null;
  }
}

export type UpsellProduct = {
  id: string;
  title: string;
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  variants: { edges: Array<{ node: { id: string } }> };
};

export async function getUpsellProducts(ids: string[]): Promise<UpsellProduct[]> {
  if (!ids.length) return [];
  try {
    const res = await shopifyFetch<any>({
      query: `
        query GetProductNodes($ids: [ID!]!) {
          nodes(ids: $ids) {
            ... on Product {
              id
              title
              featuredImage { url altText }
              priceRange {
                minVariantPrice { amount currencyCode }
              }
              variants(first: 1) {
                edges { node { id } }
              }
            }
          }
        }
      `,
      variables: { ids },
    });
    return (res.body.data.nodes as any[]).filter(Boolean);
  } catch (e) {
    console.error('[Shopify] getUpsellProducts failed:', e);
    return [];
  }
}

export type CatalogCard = {
  handle: string;
  title: string;
  description: string;
  price: string;
  currencyCode: string;
  image?: string;
  secondaryImage?: string;
  variantId?: string;
};

// Fetch products by tag via Storefront API (e.g. tag 'fragrance-oil', 'car-diffusers').
// Used to render catalog/collection grids dynamically without hardcoded IDs.
export async function getProductsByTag(
  tags: string | string[],
  sortKey: string = 'TITLE',
): Promise<CatalogCard[]> {
  const q = (Array.isArray(tags) ? tags : [tags]).map((t) => `tag:${t}`).join(' OR ');
  try {
    const res = await shopifyFetch<any>({
      query: `
        query getByTag($q: String, $sortKey: ProductSortKeys) {
          products(first: 100, query: $q, sortKey: $sortKey) {
            edges {
              node {
                handle
                title
                description
                featuredImage { url altText }
                images(first: 2) { edges { node { url } } }
                variants(first: 1) { edges { node { id } } }
                priceRange { minVariantPrice { amount currencyCode } }
              }
            }
          }
        }
      `,
      variables: { q, sortKey },
    });
    return (res.body.data.products.edges as any[]).map((e) => {
      const primary = e.node.featuredImage?.url as string | undefined;
      const imgs = (e.node.images?.edges ?? []).map((g: any) => g.node.url as string);
      return {
        handle: e.node.handle,
        title: e.node.title,
        description: e.node.description ?? '',
        price: e.node.priceRange.minVariantPrice.amount,
        currencyCode: e.node.priceRange.minVariantPrice.currencyCode,
        image: primary ?? imgs[0],
        secondaryImage: imgs.find((u: string) => u !== (primary ?? imgs[0])),
        variantId: e.node.variants?.edges?.[0]?.node?.id,
      };
    });
  } catch (e) {
    console.error('[Shopify] getProductsByTag failed:', tags, e);
    return [];
  }
}

export async function getProducts({
  query,
  reverse,
  sortKey,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  try {
  const res = await shopifyFetch<any>({
    query: `
      query getProducts($query: String, $reverse: Boolean, $sortKey: ProductSortKeys) {
        products(first: 100, query: $query, reverse: $reverse, sortKey: $sortKey) {
          edges {
            node {
              id
              handle
              availableForSale
              title
              description
              descriptionHtml
              options {
                id
                name
                values
              }
              priceRange {
                maxVariantPrice {
                  amount
                  currencyCode
                }
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              variants(first: 250) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    selectedOptions {
                      name
                      value
                    }
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
              featuredImage {
                url
                altText
                width
                height
              }
              images(first: 20) {
                edges {
                  node {
                    url
                    altText
                    width
                    height
                  }
                }
              }
              seo {
                title
                description
              }
              tags
              updatedAt
            }
          }
        }
      }
    `,
    variables: {
      query,
      reverse,
      sortKey,
    },
  });

  return res.body.data.products.edges.map((edge: any) => edge.node);
  } catch (e) {
    console.error('[Shopify] getProducts failed:', e);
    return [];
  }
}
