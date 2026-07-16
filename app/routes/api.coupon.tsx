import type {Route} from './+types/api.coupon';
import {fetchContent} from '@croct/plug-hydrogen/server';

export type CouponResponse =
  | {
      valid: true;
      code: string;
      title: string;
      discount: number;
      maxDiscount?: number;
      freeShipping: boolean;
    }
  | {
      valid: false;
      reason: string;
    };

/**
 * Validates a coupon code against the personalized `coupons` slot.
 *
 * Croct evaluates the eligibility of each coupon per visitor, so the same
 * code can be valid for one visitor and rejected with a reason for another.
 */
export async function action({request, context}: Route.ActionArgs) {
  const body = (await request.json()) as {code?: string};
  const code = typeof body.code === 'string' ? body.code.trim() : '';

  if (code === '') {
    return respond({valid: false, reason: 'Please enter a coupon code.'});
  }

  const {
    content: {coupons},
  } = await fetchContent('coupons@3', {scope: context});

  const coupon = coupons.find(
    (candidate) => candidate.code.toUpperCase() === code.toUpperCase(),
  );

  if (coupon === undefined) {
    return respond({valid: false, reason: 'This coupon code is not valid.'});
  }

  if (!coupon.eligible) {
    return respond({valid: false, reason: coupon.rule});
  }

  return respond({
    valid: true,
    code: coupon.code,
    title: coupon.title,
    discount: coupon.discount ?? 0,
    maxDiscount: coupon.maxDiscount,
    freeShipping: coupon.freeShipping,
  });
}

function respond(response: CouponResponse) {
  return Response.json(response);
}
