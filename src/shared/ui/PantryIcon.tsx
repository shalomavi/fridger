/**
 * Traced from a user-supplied reference SVG of a stocked pantry cabinet.
 * Shared by TabIcons (nav bar), FormIcons (the moved-to-pantry toast), and
 * CategoryIcons (the pantry category tag) — all three rendered the exact
 * same glyph before, so it lives here once instead of duplicated three
 * times at this size. viewBox is cropped tight to the artwork's actual
 * bounding box (not the source file's full 0 0 1216 1216 canvas, which has
 * a lot of unused margin), and strokeWidth is bumped well past the source
 * file's own 12 to get close to every other icon's ~2/24 stroke-to-viewbox
 * ratio. Can't hit that ratio exactly without the smallest interior shapes
 * (the bottle, jar, sack) turning into solid blobs — this is a compromise
 * between matching sibling boldness and keeping those shapes as rings
 * rather than dots. They were already near sub-pixel at 16-20px regardless.
 */
export function PantryIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="195 148 825 930" aria-hidden className={className}>
      <g fill="none" stroke="currentColor" strokeWidth={45} strokeLinecap="round" strokeLinejoin="round">
        <rect x="245" y="198" width="725" height="760" rx="55" />
        <rect x="288" y="239" width="639" height="671" rx="35" />

        <path d="M607 244 V909" />
        <path d="M292 457 H923" />
        <path d="M292 678 H923" />

        <path d="M315 958 V1028 H402 Q416 1028 421 1014 H795 Q800 1028 814 1028 H902 V958" />

        <path
          d="M465 447 V373
             Q465 357 473 343
             L481 327 V315
             H510 V327 L518 343
             Q526 357 526 373 V447
             Q526 451 520 451 H471 Q465 451 465 447 Z"
        />
        <path d="M478 315 H513 Q520 315 520 306 Q520 297 513 297 H478 Q469 297 469 306 Q469 315 478 315 Z" />
        <path d="M466 383 H526" />
        <path d="M466 418 H526" />

        <circle cx="548" cy="600" r="25" />

        <path
          d="M667 597
             Q667 580 684 580
             Q700 580 707 590
             H753
             Q766 590 770 604
             L774 667
             Q775 680 761 680
             H705
             Q692 680 692 667
             V623
             Q692 611 681 611
             Q667 611 667 597 Z"
        />

        <path
          d="M803 582
             Q803 568 816 568
             H851
             Q864 568 864 582
             V596
             Q869 604 869 618
             V670
             Q869 680 858 680
             H810
             Q799 680 799 670
             V618
             Q799 604 803 596 Z"
        />
        <path d="M807 568 H857 Q864 568 864 560 Q864 551 857 551 H807 Q799 551 799 560 Q799 568 807 568 Z" />

        <path
          d="M365 907
             Q369 880 374 854
             Q380 826 382 793
             Q386 769 408 758
             Q429 746 449 758
             Q470 746 492 758
             Q514 769 518 793
             Q520 826 526 854
             Q531 880 535 907
             Q515 913 496 907
             Q475 914 450 907
             Q425 914 404 907
             Q384 913 365 907 Z"
        />
        <path
          d="M383 785
             Q397 775 410 779
             Q428 790 449 779
             Q470 790 489 779
             Q503 775 516 785"
        />
      </g>
    </svg>
  )
}
