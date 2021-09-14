const express = require('express');
const MOCK_DB = require('./mocks');

const router = new express.Router();

router.get('/users/get', (request, response) => {
  const { query } = request;
  if (query.id) {
    const user = MOCK_DB.users.find(user => user.id === query.id);
    if (user) {
      response.json({ data: user });
      return;
    }
  }

  if (query.username) {
    const user = MOCK_DB.users.find(user => user.username === query.username);
    if (user) {
      response.json({ data: user });
      return;
    }
  }

  if (query.address) {
    const user = MOCK_DB.users.find(user => user.address === query.address);
    if (user) {
      response.json({ data: user });
      return;
    }
  }

  response.json({
    error: 'ERR_USER_NOT_FOUND',
  });
});

router.get('/collections/get', (request, response) => {
  const { query } = request;
  // TODO
  // return hidden collections if req.get('Authentication') matches the requested user
  const user = MOCK_DB.users.find(user => user.username === query.username);
  if (!user) {
    response.json({
      error: 'ERR_NO_COLLECTIONS_FOUND_FOR_USER',
    });
    return;
  }

  const collectionsForUser = MOCK_DB.collections.filter(
    collection => collection.ownerUserId === user.id,
  );
  if (collectionsForUser.length > 0) {
    response.json({
      data: {
        collections: collectionsForUser,
      },
    });
    return;
  }

  response.json({
    error: 'ERR_NO_COLLECTIONS_FOUND_FOR_USER',
  });
});

router.get('/nfts/get', (request, response) => {
  const { query } = request;
  const nft = MOCK_DB.nfts.find(nft => nft.id === query.id);
  if (!nft) {
    response.json({
      error: 'ERR_NFT_NOT_FOUND',
    });
    return;
  }

  response.json({ data: nft });
});

router.get('/auth/get_preflight', (request, response) => {
  response.json({
    data: {
      nonce: '1234',
      user_exists: false,
    },
  });
});

router.post('/users/login', (request, response) => {
  response.json({
    data: {
      sig_valid: true,
      jwt_token: 'token',
      user_id: 'PAoGbFB6OQtZ6mWI/BYyLA==',
    },
  });
});

router.post('/users/create', (request, response) => {
  response.json({
    data: {
      sig_valid: true,
      jwt_token: 'token',
      user_id: 'PAoGbFB6OQtZ6mWI/BYyLA==',
    },
  });
});

module.exports = router;
