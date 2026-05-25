'use client';

import { useEffect } from 'react';
import { trackViewContent, type ProductPayload } from './events';

export default function ProductViewTracker(props: ProductPayload) {
  useEffect(() => {
    trackViewContent(props);
  }, [props.id, props.name, props.price, props.currency, props.quantity, props.category]);
  return null;
}
