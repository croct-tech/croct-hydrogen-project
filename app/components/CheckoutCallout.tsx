import type {SlotContent} from '@croct/plug-hydrogen';

/**
 * Personalized callout shown next to the cart summary.
 *
 * The content comes from the `checkout-callout` slot fetched server-side in
 * the cart loader, useful for per-visitor nudges like shipping thresholds or
 * gift offers.
 */
export function CheckoutCallout({
  content,
}: {
  content: SlotContent<'checkout-callout@2'>;
}) {
  return (
    <div className="checkout-callout">
      {content.icon !== '' && (
        <img src={content.icon} alt="" width={28} height={28} />
      )}
      <div>
        <p className="checkout-callout-title">{content.title}</p>
        <p className="checkout-callout-text">{content.text}</p>
      </div>
    </div>
  );
}
