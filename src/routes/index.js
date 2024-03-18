const router = require('express').Router();
const mondayRoutes = require('./monday');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

router.use(mondayRoutes);

// Text（テキスト列）の空文字 or Null チェック テキスト列の値がオブジェクト型でやって来るので、普通の
router.post(
  '/isempty',
  [
    body('payload.inputFields.columnValue').custom((value) => {
      if (typeof value === 'object' && value !== null) {
        // オブジェクトのvalueキーが空文字やnullでないことを確認
        return value.value !== '' && value.value !== null;
      }
      // 直接の文字列値が空文字やnullでないことを確認（念のためオブジェクト型ではなくなったときも対応できますように）
      return value !== '' && value !== null;
    }),
  ],
  (req, res) => {
    const token = req.headers.authorization;
    const decoded = jwt.decode(token);
    // console.log("SHORTLIVEDTOKEN:", decoded.shortLivedToken);

    const errors = validationResult(req);
    let validationMessage;

    if (!errors.isEmpty()) {
      //validationMessage = "未入力です。値を入力してください";
      // validationMessage = '2'; // 状態カラムに表示される内容：値は無効です
      validationMessage = req.body.payload.inputFields.FailTextValue;
      console.log('未入力です。値を入力してください');
      //return res.status(400).json({ errors: errors.array() });
      //return res.sendStatus(200)
    } else {
      //validationMessage = "値が正常に入力されました";
      // validationMessage = '1'; // 状態カラムに表示される内容：値は正常です
      validationMessage = req.body.payload.inputFields.SuccessTextValue;
      console.log('値が正常に入力されました');
    }

    let myHeaders = new Headers();
    myHeaders.append('Authorization', decoded.shortLivedToken);
    myHeaders.append('Content-Type', 'application/json');

    let query = JSON.stringify({
      query: `mutation {change_simple_column_value(board_id: ${req.body.payload.inputFields.boardId}, item_id: ${req.body.payload.inputFields.itemId}, column_id: "${req.body.payload.inputFields.targetColumnId}", value: "${validationMessage}") {id}}`,
    });

    let requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: query,
      redirect: 'follow',
    };

    fetch('https://api.monday.com/v2', requestOptions)
      .then((response) => response.json()) // ここでJSON形式でレスポンスを解析
      .then((result) => {
        // 成功した結果をクライアントに返す
        res.json({ success: true, result: result });
      })
      .catch((error) => {
        // エラーがあればクライアントにエラー情報を返す
        console.log('error', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      });
    // .then((response) => response.text())
    // .then((result) => console.log(result))
    // .catch((error) => console.log('error', error));
  }
);

router.post(
  '/Contains',
  [
    body('payload.inputFields.columnValue').custom((value, { req }) => {
      const searchText = req.body.payload.inputFields.SearchTextValue;
      if (!value.value.includes(searchText)) {
        throw new Error(`columnValue must contain "${searchText}"`);
      }
      return true; // バリデーション成功
    }),
  ],
  (req, res) => {
    const token = req.headers.authorization;
    const decoded = jwt.decode(token);

    const errors = validationResult(req);
    let validationMessage;

    if (!errors.isEmpty()) {
      validationMessage = req.body.payload.inputFields.FailTextValue;
    } else {
      // バリデーション成功時の処理
      // res.send('Validation passed');
      validationMessage = req.body.payload.inputFields.SuccessTextValue;
      console.log('値が正常に入力されました');
    }
    let myHeaders = new Headers();
    myHeaders.append('Authorization', decoded.shortLivedToken);
    myHeaders.append('Content-Type', 'application/json');

    let query = JSON.stringify({
      query: `mutation {change_simple_column_value(board_id: ${req.body.payload.inputFields.boardId}, item_id: ${req.body.payload.inputFields.itemId}, column_id: "${req.body.payload.inputFields.targetColumnId}", value: "${validationMessage}") {id}}`,
    });

    let requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: query,
      redirect: 'follow',
    };

    fetch('https://api.monday.com/v2', requestOptions)
      .then((response) => response.json()) // ここでJSON形式でレスポンスを解析
      .then((result) => {
        // 成功した結果をクライアントに返す
        res.json({ success: true, result: result });
      })
      .catch((error) => {
        // エラーがあればクライアントにエラー情報を返す
        console.log('error', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      });
    // .then((response) => response.text())
    // .then((result) => console.log(result))
    // .catch((error) => console.log('error', error));
  }
);

// router.get('/', function (req, res) {
//   res.json(getHealth());
// });
// router.get('/health', function (req, res) {
//   res.json(getHealth());
//   res.end();
// });

// function getHealth() {
//   return {
//     ok: true,
//     message: 'Healthy',
//   };
// }

module.exports = router;
