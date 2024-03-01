const router = require('express').Router();
const mondayRoutes = require('./monday');
const { body, validationResult } = require('express-validator');
//const jwt_decode = require('jwt-decode');
// const jwt_decode = require('jwt-decode').default;
//const jwtDecode = require('jwt-decode');
const jwt = require("jsonwebtoken");
const fetch = require('node-fetch');

router.use(mondayRoutes);

router.get('/', function (req, res) {
  res.json(getHealth());
});

router.get('/health', function (req, res) {
  res.json(getHealth());
  res.end();
});

router.post('/isempty', [
  body('payload.inputFields.columnValue').custom(value => {
    if (typeof value === 'object' && value !== null) {
      // オブジェクトのvalueキーが空文字やnullでないことを確認
      return value.value !== '' && value.value !== null;
    }
    // 直接の文字列値が空文字やnullでないことを確認（念のためオブジェクト型ではなくなったときも対応できますように）
    return value !== '' && value !== null;
  })
], (req, res) => {
  //res.status(200).send({});
  const token = req.headers.authorization;
  const decoded = jwt.decode(token);
  //const decoded = jwt.verify(token);
  //  console.log("INPUT FIELDS:", req.body.payload.inputFields);
  //console.log("token:",token);
  console.log("SHORTLIVEDTOKEN:", decoded.shortLivedToken);
  console.log("boardId", req.body.payload.inputFields.boardId);
  console.log("itemId",req.body.payload.inputFields.itemId)

  const errors = validationResult(req);
  let validationMessage;

  if (!errors.isEmpty()) {
    //validationMessage = "未入力です。値を入力してください";
    //validationMessage = "Null or Empty";
    validationMessage = "未入力です。値を入力してください";
    console.log("未入力です。値を入力してください");
    //return res.status(400).json({ errors: errors.array() });
    //return res.sendStatus(200)
  }
  else
  {
    //validationMessage = "値が正常に入力されました";
    // validationMessage = "OK";
    validationMessage = "値が正常に入力されました";
    console.log("値が正常に入力されました");
  }
  //res.sendStatus(200);

  //const textValue = JSON.stringify(validationMessage);
   //const query = `mutation {change_simple_column_value(board_id: ${req.body.payload.inputFields.boardId}, item_id: ${req.body.payload.inputFields.itemId}, column_id: "text5", value: "${validationMessage}") {id}}`;
   //---------------- コメントアウトここから
   //  const query = {'query' : `mutation {change_simple_column_value(board_id: ${req.body.payload.inputFields.boardId}, item_id: ${req.body.payload.inputFields.itemId}, column_id: "text5", value: "${validationMessage}") {id}}`};
  //  console.log(query);

  // fetch ("http://api.monday.com/v2",{
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': decoded.shortLivedToken
  //     //'Authorization': `Bearer ${your_auth_token}`
  //   },
  //    body: JSON.stringify({
  //      'query' : `mutation {change_simple_column_value(board_id: ${req.body.payload.inputFields.boardId}, item_id: ${req.body.payload.inputFields.itemId}, column_id: "text5", value: "${validationMessage}") {id}}`
  //    })
  // })
  // .then(response => response.json())
  // .then(data => {
  //   console.log(data);
  //   res.status(200).send(data); // GraphQLの応答をクライアントに送信
  // })
  // .catch(error => {
  //   console.error('Error:', error);
  //   res.status(500).send({ message: '内部サーバーエラー' });
  // });
  //res.sendStatus(200)
  //res.status(200).send({});

  //---------------- コメントアウトここまで
//---------------- 提案されたコードここから
  let myHeaders = new Headers(); 
  myHeaders.append("Authorization", decoded.shortLivedToken); 
  myHeaders.append("Content-Type", "application/json"); 
   
  let queryTwo = JSON.stringify({ 
    "query": `mutation {change_simple_column_value(board_id: ${req.body.payload.inputFields.boardId}, item_id: ${req.body.payload.inputFields.itemId}, column_id: "text5", value: "${validationMessage}") {id}}` 
  }); 
   
  let requestOptions = { 
    method: 'POST', 
    headers: myHeaders, 
    body: queryTwo, 
    redirect: 'follow' 
  }; 
   
  fetch("https://api.monday.com/v2", requestOptions) 
    .then(response => response.text()) 
    .then(result => console.log(result)) 
    .catch(error => console.log('error', error)) 
//---------------- 提案されたコードここまで

});

// .then(response => response.json())
//   .then(data => console.log(data))
//   .catch(error => console.error('Error:', error));

//   // レスポンスを送信
//   //res.status(200).send({ message: validationMessage });
//   res.sendStatus(200);
// })
function getHealth() {
  return {
    ok: true,
    message: 'Healthy',
  };
}

module.exports = router;
