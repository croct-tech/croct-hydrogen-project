import {type FormEvent, useState} from 'react';
import {useFetcher} from 'react-router';
import {CartForm} from '@shopify/hydrogen';
import {useCroct} from '@croct/plug-hydrogen';
import type {CouponResponse} from '~/routes/api.coupon';

type AppliedCoupon = Extract<CouponResponse, {valid: true}>;

/**
 * Coupon input validated by Croct.
 *
 * The code is checked against the personalized `coupons` slot through the
 * `/api/coupon` route: Croct evaluates the eligibility of each coupon per
 * visitor, so the same code can be accepted for one visitor and rejected
 * with a reason for another. Valid codes are also applied to the Shopify
 * cart as discount codes.
 */
export function CouponInput({inputId}: {inputId: string}) {
  const croct = useCroct();
  const fetcher = useFetcher();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState<AppliedCoupon | null>(null);

  function updateCartDiscountCodes(discountCodes: string[]) {
    void fetcher.submit(
      {
        [CartForm.INPUT_NAME]: JSON.stringify({
          action: CartForm.ACTIONS.DiscountCodesUpdate,
          inputs: {discountCodes},
        }),
      },
      {method: 'POST', action: '/cart'},
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (code.trim() === '' || loading) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/coupon', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({code: code.trim()}),
      });

      const result = (await response.json()) as CouponResponse;

      if (result.valid) {
        setApplied(result);
        updateCartDiscountCodes([result.code]);

        void croct.track('goalCompleted', {
          goalId: 'coupon-redemption',
          value: result.discount,
        });
      } else {
        setError(result.reason);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleRemove() {
    setApplied(null);
    setCode('');
    setError('');
    updateCartDiscountCodes([]);
  }

  if (applied !== null) {
    return (
      <section aria-label="Coupon" className="coupon">
        <div className="coupon-applied">
          <div>
            <code>{applied.code.toUpperCase()}</code>
            <p>{applied.title}</p>
          </div>
          <button type="button" onClick={handleRemove}>
            Remove
          </button>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Coupon" className="coupon">
      <form
        className="cart-code-row"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <label htmlFor={inputId} className="sr-only">
          Discount code
        </label>
        <input
          id={inputId}
          type="text"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Discount code"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Checking...' : 'Apply'}
        </button>
      </form>
      {error !== '' && <p className="coupon-error">{error}</p>}
    </section>
  );
}
