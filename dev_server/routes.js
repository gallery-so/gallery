const express = require('express');
const MOCK_DB = require('./mocks');

const router = express.Router();

router.get('/users/get', (req, res) => {
  const { query } = req;
  if (query.id) {
    const user = MOCK_DB.users.find((user) => user.id === query.id);
    if (user) {
      res.json({ data: user });
      return;
    }
  }
  if (query.username) {
    const user = MOCK_DB.users.find((user) => user.username === query.username);
    if (user) {
      res.json({ data: user });
      return;
    }
  }
  if (query.address) {
    const user = MOCK_DB.users.find((user) => user.address === query.address);
    if (user) {
      res.json({ data: user });
      return;
    }
  }
  res.json({
    error: 'ERR_USER_NOT_FOUND',
  });
});

router.get('/collections/get', (req, res) => {
  const { query } = req;
  // TODO
  // return hidden collections if req.get('Authentication') matches the requested user
  const user = MOCK_DB.users.find((user) => user.username === query.username);
  if (!user) {
    res.json({
      error: 'ERR_NO_COLLECTIONS_FOUND_FOR_USER',
    });
    return;
  }
  const collectionsForUser = MOCK_DB.collections.filter(
    (collection) => collection.ownerUserId === user.id
  );
  if (collectionsForUser.length) {
    res.json({
      data: {
        collections: collectionsForUser,
      },
    });
    return;
  }
  res.json({
    error: 'ERR_NO_COLLECTIONS_FOUND_FOR_USER',
  });
});

router.get('/nfts/get', (req, res) => {
  const { query } = req;
  const nft = MOCK_DB.nfts.find((nft) => nft.id === query.id);
  if (!nft) {
    res.json({
      error: 'ERR_NFT_NOT_FOUND',
    });
    return;
  }
  res.json({ data: nft });
  return;
});

router.get('/auth/get_preflight', (req, res) => {
  const { query } = req;
  console.log(query);
  res.json({
    data: {
      nonce: '1234',
      user_exists: false,
    },
  });
  return;
});

router.post('/users/login', (req, res) => {
  const { query } = req;
  res.json({
    data: {
      sig_valid: true,
      jwt_token: 'token',
      user_id: 'PAoGbFB6OQtZ6mWI/BYyLA==',
    },
  });
  return;
});

router.post('/users/create', (req, res) => {
  const { query } = req;
  res.json({
    data: {
      sig_valid: true,
      jwt_token: 'token',
      user_id: 'PAoGbFB6OQtZ6mWI/BYyLA==',
    },
  });
  return;
});

module.exports = router;
