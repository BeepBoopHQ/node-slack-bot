const pokemonList = [
  { name: 'pidgeot', img: 'http://media-cerulean.cursecdn.com/avatars/274/719/018_00.png' },
  { name: 'mewtwo', img: 'http://pkmn.net/sprites/blackwhite/front/150.png' },
  { name: 'arcanine', img: 'https://i.dstatic.com/images/pokemon/front/normal/arcanine.png' },
  { name: 'poliwrath', img: 'https://urpgstatic.com/img_library/pokemon_sprites/062.png' },
  { name: 'victreebel', img: 'http://pokedream.com/pokedex/images/blackwhite/front/071.png' },
  { name: 'ampharos', img: 'https://media.pocketmonsters.net/dex//5/bw/181.png' },
  { name: 'squirtle', img: 'http://pokedream.com/pokedex/images/blackwhite/front-alt/007.png' },
  { name: 'lugia', img: 'http://pokedream.com/pokedex/images/blackwhite/front-alt/249.png' },
  { name: 'wigglytuff', img: 'https://i.dstatic.com/images/pokemon/front/normal/wigglytuff.png' },
  { name: 'bulbasaur', img: 'https://i.dstatic.com/images/pokemon/front/retro/bulbasaur.png' },
  { name: 'gengar', img: 'http://cdn.bulbagarden.net/upload/2/21/Spr_5b_094.png' }
];

module.exports.commandPokemon = (message, args) => {
  // list the pkmn
  let reply = {
    'username': 'Professor Oak',
    'icon_url': 'http://66.media.tumblr.com/avatar_560e9f72e0bf_128.png',
    'text': 'here are the pokemon at your disposal! use `!ichooseyou <pokemon>`!\n```'
  };

  for (let i in pokemonList) {
    reply.text += pokemonList[i].name + '\n';
  }

  reply.text += '```';

  return [{
    type: 'custom',
    message: reply
  }];
};

module.exports.commandIChooseYou = (message, args) => {
  // ok so you say a pokeman and if it matches it shows a badass pic of the pokemon
  let chosenPokemon = '';
  let chosenPokemonImg = '';
  let reply = {};

  for (let i in pokemonList) {
    if (pokemonList[i].name.toLowerCase() === args.toLowerCase()) {
      chosenPokemon = pokemonList[i].name;
      chosenPokemonImg = pokemonList[i].img;
    }
  }

  if (chosenPokemon !== '' && chosenPokemonImg !== '') {
    reply = {
      'username': 'Professor Oak',
      'icon_url': 'http://66.media.tumblr.com/avatar_560e9f72e0bf_128.png',
      'attachments': [{
        'fallback': `<@${message.user}> chooses ${chosenPokemon}!`,
        'text': `<@${message.user}> chooses ${chosenPokemon}!`,
        'image_url': chosenPokemonImg
      }]
    };

    return [{
      type: 'custom',
      message: reply
    }];
  }

  reply = {
    'username': 'Professor Oak',
    'icon_url': 'http://66.media.tumblr.com/avatar_560e9f72e0bf_128.png',
    'text': `<@${message.user}>, no such pokemon! use \`!pokemon\``
  };

  return [{
    type: 'custom',
    message: reply
  }];
};
