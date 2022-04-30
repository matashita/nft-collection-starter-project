// useEffect と useState 関数を React.js からインポートしています。
import React, { useEffect, useState } from "react";
import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import { ethers } from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";
// Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
const CONTRACT_ADDRESS =
"0x00d7eDFE531508f36aAeF36589DcA8452F0097C1";
const TWITTER_HANDLE = "Matashita3";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "";
const TOTAL_MINT_COUNT = 50;
const App = () => {
  /*
   * ユーザーのウォレットアドレスを格納するために使用する状態変数を定義します。
   */
  const [currentAccount, setCurrentAccount] = useState("");
  const [minting, setMinting] = useState(false);
  const [mintedImg, setMintedImg] = useState("");
  const [mintedNFT, setMintedNFT] = useState(false)

  const openModal = () => {
    fetchNFTMetadata();
    setMintedNFT(true)
  }
  /*この段階でcurrentAccountの中身は空*/
  console.log("currentAccount: ", currentAccount);
  /*
   * ユーザーが認証可能なウォレットアドレスを持っているか確認します。
   */
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }
    /* ユーザーが認証可能なウォレットアドレスを持っている場合は、
     * ユーザーに対してウォレットへのアクセス許可を求める。
     * 許可されれば、ユーザーの最初のウォレットアドレスを
     * accounts に格納する。
     */
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      
      let chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("Connected to chain " + chainId);
      // 0x4 は　Rinkeby の ID です。
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      }

        // **** イベントリスナーをここで設定 ****
      // この時点で、ユーザーはウォレット接続が済んでいます。
      //setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  };

  /*
   * connectWallet メソッドを実装します。
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      /*
       * ウォレットアドレスに対してアクセスをリクエストしています。
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);
      /*
       * ウォレットアドレスを currentAccount に紐付けます。
       */
      setCurrentAccount(accounts[0]);

      // **** イベントリスナーをここで設定 ****
      //setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchNFTMetadata = async () => {
    console.log("Checking for Character NFT on address:", currentAccount);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const connectedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      myEpicNft.abi,
      signer
    );
    // function を実行
    const txn = await connectedContract.tokenURI(1);
      console.log(txn);
      const response = await fetch(txn);
      const json = await response.json();
      setMintedImg(json.image);
      console.log(json);
  };

// setupEventListener 関数を定義します。
// MyEpicNFT.sol の中で event が　emit された時に、
// 情報を受け取ります。
const setupEventListener = async () => {
  try {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      // NFT が発行されます。
      const connectedContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicNft.abi,
        signer
      );
      // Event が　emit される際に、コントラクトから送信される情報を受け取っています。
      connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
        console.log(from, tokenId.toNumber());
        alert(
          `あなたのウォレットに NFT を送信しました。OpenSea に表示されるまで最大で10分かかることがあります。NFT へのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
        );
      });
      console.log("Setup event listener!");
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error);
  }
};

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);
    // 0x4 は　Rinkeby の ID です。
    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
    }else{
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        console.log("Mining...please wait.");
        setMinting(true);
        await nftTxn.wait();
        setMinting(false);
        openModal();
        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      }
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // renderNotConnectedContainer メソッドを定義します。
  const renderMinting = () => (
    <p className="mint-text">
      New NFT Minting...
    </p>
  );

  // renderNotConnectedContainer メソッドを定義します。
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );
  /*
   * ページがロードされたときに useEffect()内の関数が呼び出されます。
   */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Full On Chain NFT</p>
          <p className="sub-text">Your address : {currentAccount}</p>
          {/*条件付きレンダリングを追加しました
          // すでに接続されている場合は、
          // Connect to Walletを表示しないようにします。*/}
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
              Mint NFT
            </button>
          )}
          {minting === true ? (
            renderMinting()
          ):(
            <div></div>
          )}
          <Modal show={mintedNFT} setShow={setMintedNFT} content={mintedImg} />
          <div className="middle-container">
            <a href="https://rinkeby.rarible.com/search/items/0x00d7eDFE531508f36aAeF36589DcA8452F0097C1" className="nft-rink">
              Rarible
            </a>
            <a href="https://testnets.opensea.io/collection/squarenft-yi8xnjjvct" className="nft-rink">
              Opensea
            </a>
          </div>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
      
    </div>
  );
};

function Modal({show, setShow, content}) {
  const closeModal = () => {
    setShow(false)
  }
  if (show) {
    return (
      <div id="overlay" onClick={closeModal}>
        <div id="content" onClick={(e) => e.stopPropagation()}>
          <img src={content} alt="Minted image" className="minted-img" />
          <button className="img-close" onClick={closeModal}>×</button>
        </div>
      </div >
    )
  } else {
    return null;
  }
}

export default App;