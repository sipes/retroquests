// What you sell. Prices are in cents. Add a game by adding its products and hints here.

export const CATALOG = {
  'port-lucky': {
    name: 'Last Night in Port Lucky (full game)',
    description: 'Unlocks every scene after the free one. Yours to keep.',
    price_cents: 799,
    game: 'port-lucky'
  },
  'port-lucky-walkthrough': {
    name: 'Port Lucky walkthrough add-on',
    description: 'Hidden, step-by-step hints for every puzzle.',
    price_cents: 199,
    game: 'port-lucky',
    requires: 'port-lucky'
  }
};

// Hint text lives on the server so it only reaches players who bought the add-on.
// Each puzzle: [nudge, clue, full solution].
export const GAMES = {
  'port-lucky': {
    walkthroughSku: 'port-lucky-walkthrough',
    puzzles: {
      goat: [
        "The goat isn't handing anything over for free. What would it rather be chewing?",
        'There is food in this suite. It is very expensive and very small. Check the minibar.',
        'Open the minibar and take the Crackers of Regret. Then use the crackers on the goat. It drops your keycard.'
      ],
      clue: [
        'Last night left you a few souvenirs. One of them is large, brass and lying on the floor.',
        'Something papery is stuck deep inside the tuba.',
        'Take (or search) the tuba to pull out the valet ticket. Calling the front desk on the phone tells you why it matters.'
      ],
      door: [
        'You need two things before you leave: a way through the door, and a lead on where Benny went.',
        'The lock wants your keycard. The lead is the valet ticket.',
        'Once you have the keycard and the valet ticket, use the keycard on the door.'
      ],
      valet: [
        'Kevin only deals in one currency.',
        'You brought something from the suite that belongs at this valet stand.',
        'Give the valet ticket to Kevin (use the ticket on the valet).'
      ],
      truck: [
        'Your new vehicle may know more about last night than you do.',
        'Unlock it with whatever Kevin handed you, then look inside.',
        'Use the truck keys on the ice-cream truck. Take the shoe and the receipt from the serving window.'
      ]
    }
  }
};
