// Implementation of order book for secondary issues of security tokens that support multiple order types
// (c) Kallol Borah, 2022
//"SPDX-License-Identifier: BUSL1.1"

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "./interfaces/IOrder.sol";
import "./interfaces/ITrade.sol";
import "./interfaces/ISecondaryIssuePool.sol";

import "@balancer-labs/v2-solidity-utils/contracts/math/Math.sol";
import "@balancer-labs/v2-solidity-utils/contracts/math/FixedPoint.sol";
import "@balancer-labs/v2-solidity-utils/contracts/openzeppelin/Ownable.sol";
import "@balancer-labs/v2-interfaces/contracts/vault/IPoolSwapStructs.sol";
contract Orderbook is IOrder, ITrade, Ownable{
    using FixedPoint for uint256;

    //counter for block timestamp nonce for creating unique order references
    uint256 private _previousTs = 0;

    //order references
    bytes32[] private _orderRefs;

    //mapping order reference to order
    mapping(bytes32 => IOrder.order) private orders;

    //mapping order reference to position
    mapping(bytes32 => uint256) private _orderIndex;

    //mapping users to order references
    mapping(address => bytes32[]) private _userOrderRefs;

    //mapping user's order reference to positions
    mapping(bytes32 => uint256) private _userOrderIndex;

    //market order book
    bytes32[] private _marketOrders;

    //limit order book
    bytes32[] private _limitOrders;

    mapping(bytes32 => uint256) private _limitOrderIndex;

    //stop loss order book
    bytes32[] private _stopOrders;

    mapping(bytes32 => uint256) private _stopOrderIndex;

    //order references from party to order timestamp
    mapping(address => mapping(uint256 => ITrade.trade)) private tradeRefs;

    //mapping parties to trade time stamps
    mapping(address => uint256[]) private trades;

    address private _security;
    address private _currency;
    address payable private _balancerManager;
    address private _pool;

    event CallSwap( bool swapKindParty, string tokenInParty, address party, 
                    bool swapKindCounterparty, string tokenInCounterparty, address counterParty, uint256 swapId); 

    constructor(address balancerManager, address security, address currency, address pool){        
        _balancerManager = payable(balancerManager);
        _security = security;
        _currency = currency;
        _pool = pool; 
    }

    function getPoolId() external override view returns(bytes32){
        bytes32 _poolId = ISecondaryIssuePool(_pool).getPoolId();
        return _poolId;
    }

    function getSecurity() external override view returns (address) {
        return _security;
    }

    function getCurrency() external override view returns (address) {
        return _currency;
    }

    function newOrder(
        IPoolSwapStructs.SwapRequest memory _request,
        IOrder.Params memory _params,
        IOrder.Order _order,
        uint256[] memory _balances,
        uint256 _currencyIndex,
        uint256 _securityIndex
    ) public onlyOwner returns (uint256){
        require(_params.trade == IOrder.OrderType.Market || _params.trade == IOrder.OrderType.Limit || _params.trade == IOrder.OrderType.Stop);
        require(_order == IOrder.Order.Buy || _order == IOrder.Order.Sell);
        if(block.timestamp == _previousTs)
            _previousTs = _previousTs + 1;
        else
            _previousTs = block.timestamp;
        bytes32 ref = keccak256(abi.encodePacked(_request.from, _previousTs));
        //fill up order details
        IOrder.order memory nOrder = IOrder.order({
            swapKind: _request.kind,
            tokenIn: address(_request.tokenIn),
            tokenOut: address(_request.tokenOut),
            otype: _params.trade,
            order: _order,
            status: IOrder.OrderStatus.Open,
            qty: _request.amount,
            party: _request.from,
            price: _params.price,  
            currencyBalance: _balances[_currencyIndex],  
            securityBalance: _balances[_securityIndex]
        });
        orders[ref] = nOrder;
        //fill up indexes
        _orderIndex[ref] = _orderRefs.length;
        _orderRefs.push(ref);
        _userOrderIndex[ref] = _userOrderRefs[_request.from].length;
        _userOrderRefs[_request.from].push(ref);
        orders[ref].status = IOrder.OrderStatus.Open;
        if (_params.trade == IOrder.OrderType.Market) {
            _marketOrders.push(ref);
            return matchOrders(ref, IOrder.OrderType.Market);
        } else if (_params.trade == IOrder.OrderType.Limit) {
            _limitOrderIndex[ref] = _limitOrders.length;
            _limitOrders.push(ref);
            return matchOrders(ref, IOrder.OrderType.Limit);
        } else if (_params.trade == IOrder.OrderType.Stop) {
            _stopOrderIndex[ref] = _stopOrders.length;
            _stopOrders.push(ref);
            return matchOrders(ref, IOrder.OrderType.Stop);
        }
    }

    function getOrderRef() external view override returns (bytes32[] memory) {
        return _userOrderRefs[msg.sender];
    }

    function editOrder(
        bytes32 ref,
        uint256 _price,
        uint256 _qty
    ) external override {
        require (orders[ref].otype != IOrder.OrderType.Market, "Market order can not be changed");
        require(orders[ref].status == IOrder.OrderStatus.Open, "Order is already filled");
        require(orders[ref].party == msg.sender, "Sender is not order creator");
        orders[ref].price = _price;
        orders[ref].qty = _qty;
        if (orders[ref].otype == IOrder.OrderType.Limit) {
            checkLimitOrders(ref, IOrder.OrderType.Limit);
        } else if (orders[ref].otype == IOrder.OrderType.Stop) {
            checkStopOrders(ref, IOrder.OrderType.Stop);
        }        
    }

    function cancelOrder(bytes32 ref) external override {
        require (orders[ref].otype != IOrder.OrderType.Market, "Market order can not be cancelled");
        require(orders[ref].status == IOrder.OrderStatus.Open, "Order is already filled");
        require(orders[ref].party == msg.sender, "Sender is not order creator");
        if (_limitOrders.length > 0)
        {
            delete _limitOrders[_limitOrderIndex[ref]]; 
        }
        delete _limitOrderIndex[ref];
        if (_stopOrders.length > 0)
        {
            delete _stopOrders[_stopOrderIndex[ref]];
        }
        delete _stopOrderIndex[ref];
        delete orders[ref];
        delete _orderRefs[_orderIndex[ref]];
        delete _orderIndex[ref];
        delete _userOrderRefs[msg.sender][_userOrderIndex[ref]];
        delete _userOrderIndex[ref];
    }

    //check if a buy order in the limit order book can execute over the prevailing (low) price passed to the function
    //check if a sell order in the limit order book can execute under the prevailing (high) price passed to the function
    function checkLimitOrders(bytes32 _ref, IOrder.OrderType _trade) private returns (uint256){
        uint256 volume;
        for (uint256 i = 0; i < _limitOrders.length; i++) {
            if(_limitOrders[i] == 0) continue;
            if ((orders[_limitOrders[i]].order == IOrder.Order.Buy && orders[_ref].order == IOrder.Order.Sell && (orders[_limitOrders[i]].price >= orders[_ref].price || orders[_ref].price==0)) ||
                (orders[_limitOrders[i]].order == IOrder.Order.Sell && orders[_ref].order == IOrder.Order.Buy && (orders[_limitOrders[i]].price <= orders[_ref].price || orders[_ref].price==0))){
                _marketOrders.push(_limitOrders[i]);
                volume = Math.add(volume, orders[_limitOrders[i]].price.mulDown(orders[_limitOrders[i]].qty));
                if(_trade!=IOrder.OrderType.Market && _trade!=IOrder.OrderType.Stop && _limitOrders[i]!=_ref){
                //only if the consecutive order is a limit order, it goes to the market order book
                    _marketOrders.push(_ref);
                }                      
            } 
        }
        return volume;  
    }
    
    //check if a buy order in the stoploss order book can execute under the prevailing (high) price passed to the function
    //check if a sell order in the stoploss order book can execute over the prevailing (low) price passed to the function
    function checkStopOrders(bytes32 _ref, IOrder.OrderType _trade) private returns (uint256){
        uint256 volume;
        for (uint256 i = 0; i < _stopOrders.length; i++) {
            if(_stopOrders[i] == 0) continue;
            if ((orders[_stopOrders[i]].order == IOrder.Order.Buy && orders[_ref].order == IOrder.Order.Sell && (orders[_stopOrders[i]].price <= orders[_ref].price || orders[_ref].price==0)) ||
                (orders[_stopOrders[i]].order == IOrder.Order.Sell && orders[_ref].order == IOrder.Order.Buy && (orders[_stopOrders[i]].price >= orders[_ref].price || orders[_ref].price==0))){
                _marketOrders.push(_stopOrders[i]);
                volume = Math.add(volume, orders[_stopOrders[i]].price.mulDown(orders[_stopOrders[i]].qty));
                if(_trade!=IOrder.OrderType.Market && _trade!=IOrder.OrderType.Limit && _stopOrders[i]!=_ref){
                    //only if the consecutive order is a stop loss order, it goes to the market order book
                    _marketOrders.push(_ref);
                }           
            } 
        }
        return volume;
    }

    function reorder(uint256 position, IOrder.OrderType list) private {
        if (list == IOrder.OrderType.Market) {
            for (uint256 i = position; i < _marketOrders.length; i++) {
                if (i == _marketOrders.length - 1){ 
                    delete _marketOrders[position];
                }
                else _marketOrders[position] = _marketOrders[position + 1];
            }
        } else if (list == IOrder.OrderType.Limit) {
            for (uint256 i = position; i < _limitOrders.length; i++) {
                if (i == _limitOrders.length - 1) {
                    delete _limitOrders[position];
                }
                else _limitOrders[position] = _limitOrders[position + 1];
            }
        } else if (list == IOrder.OrderType.Stop) {
            for (uint256 i = position; i < _stopOrders.length; i++) {
                if (i == _stopOrders.length - 1) {
                    delete _stopOrders[position];
                }
                else _stopOrders[position] = _stopOrders[position + 1];
            }
        }
    }

    //match market orders. Sellers get the best price (highest bid) they can sell at.
    //Buyers get the best price (lowest offer) they can buy at.
    function matchOrders(bytes32 _ref, IOrder.OrderType _trade) private returns (uint256){
        bytes32 _bestBid;
        uint256 _bestBidPrice = 0;
        bytes32 _bestOffer;
        uint256 _bestOfferPrice = 0;
        uint256 _bidIndex = 0;   
        uint256 securityTraded;
        uint256 currencyTraded;
        uint256 i;
       
        //check if enough market volume exist to fulfil market orders, or if market depth is zero
        i = checkLimitOrders(_ref, _trade);
        i = Math.add(i, checkStopOrders(_ref, _trade));
        if(_trade==IOrder.OrderType.Market){
            if(i < orders[_ref].qty)
                return 0;
        }
        else if(_trade==IOrder.OrderType.Limit || _trade==IOrder.OrderType.Stop){
            if(i==0)
                return 0;
        }
        //if market depth exists, then fill order at one or more price points in the order book
        for(i=0; i<_marketOrders.length; i++){
            if (
                _marketOrders[i] != _ref && //orders can not be matched with themselves
                orders[_marketOrders[i]].party != orders[_ref].party && //orders posted by a party can not be matched by a counter offer by the same party
                orders[_marketOrders[i]].status != IOrder.OrderStatus.Filled //orders that are filled can not be matched /traded again
            ) {
                if (orders[_marketOrders[i]].price == 0 && orders[_ref].price == 0) continue; // Case: If Both CP & Party place Order@CMP
                if (orders[_marketOrders[i]].order == IOrder.Order.Buy && orders[_ref].order == IOrder.Order.Sell) {
                    if (orders[_marketOrders[i]].price >= orders[_ref].price || orders[_ref].price == 0) {
                        _bestBidPrice = orders[_marketOrders[i]].price;  
                        _bestBid = _marketOrders[i];
                        _bidIndex = i;
                    }
                } else if (orders[_marketOrders[i]].order == IOrder.Order.Sell && orders[_ref].order == IOrder.Order.Buy) {
                    // orders[_ref].price == 0 condition check for Market Order with 0 Price
                    if (orders[_marketOrders[i]].price <= orders[_ref].price || orders[_ref].price == 0) {
                        _bestOfferPrice = orders[_marketOrders[i]].price;  
                        _bestOffer = _marketOrders[i];
                        _bidIndex = i;
                    }
                }
            }
            if (orders[_ref].order == IOrder.Order.Sell) {               
                if (_bestBid != "") {
                    if(orders[_ref].tokenIn==_security && orders[_ref].swapKind==IVault.SwapKind.GIVEN_IN && orders[_ref].securityBalance>=orders[_ref].qty){
                        if(orders[_bestBid].tokenIn==_currency && orders[_bestBid].swapKind==IVault.SwapKind.GIVEN_IN){
                            securityTraded = orders[_bestBid].qty.divDown(_bestBidPrice); // calculating amount of security that can be brought
                        }else if (orders[_bestBid].tokenOut==_security && orders[_bestBid].swapKind==IVault.SwapKind.GIVEN_OUT){
                            securityTraded = orders[_bestBid].qty; // amount of security brought (tokenOut) is already there 
                        }
                        if(securityTraded >= orders[_ref].qty){
                            securityTraded = orders[_ref].qty;
                            currencyTraded = orders[_ref].qty.mulDown(_bestBidPrice);
                            orders[_bestBid].qty = orders[_bestBid].tokenIn ==_currency &&  orders[_bestBid].swapKind == IVault.SwapKind.GIVEN_OUT ? 
                                                    Math.sub(orders[_bestBid].qty, orders[_ref].qty) : Math.sub(orders[_bestBid].qty, currencyTraded);
                            orders[_ref].qty = 0;
                            orders[_bestBid].status = IOrder.OrderStatus.PartlyFilled;
                            orders[_ref].status = IOrder.OrderStatus.Filled;  
                            reportTrade(_ref, _bestBid, _bestBidPrice, securityTraded, currencyTraded);
                            reorder(0, _trade); //order ref is removed from market order list as its qty becomes zero
                            if(orders[_ref].otype == IOrder.OrderType.Market)
                                return calcTraded(_ref, orders[_ref].party, true);
                        }    
                        else{
                            currencyTraded = securityTraded.mulDown(_bestBidPrice);
                            orders[_ref].qty = Math.sub(orders[_ref].qty, securityTraded);
                            orders[_bestBid].qty = 0;
                            orders[_bestBid].status = IOrder.OrderStatus.Filled;
                            orders[_ref].status = IOrder.OrderStatus.PartlyFilled;
                            reportTrade(_ref, _bestBid, _bestBidPrice, securityTraded, currencyTraded);
                            reorder(_bidIndex, orders[_marketOrders[_bidIndex]].otype); //bid order ref is removed from market order list as its qty becomes zero
                        }
                    }
                    else if(orders[_ref].tokenOut==_currency && orders[_ref].swapKind==IVault.SwapKind.GIVEN_OUT){
                        if(orders[_bestBid].tokenOut==_security && orders[_bestBid].swapKind==IVault.SwapKind.GIVEN_OUT){
                            currencyTraded = orders[_bestBid].qty.mulDown(_bestBidPrice); // calculating amount of currency that needs to be sent in to buy security (tokenOut)
                        }else if(orders[_bestBid].tokenIn==_currency && orders[_bestBid].swapKind==IVault.SwapKind.GIVEN_IN){
                            currencyTraded = orders[_bestBid].qty; // amount of currency sent in (tokenIn) is already there
                        }
                        if(currencyTraded >= orders[_ref].qty){
                            currencyTraded = orders[_ref].qty;
                            securityTraded = orders[_ref].qty.divDown(_bestBidPrice);
                            orders[_bestBid].qty = orders[_bestBid].tokenOut ==_security &&  orders[_bestBid].swapKind == IVault.SwapKind.GIVEN_IN ? 
                                                    Math.sub(orders[_bestBid].qty, orders[_ref].qty) : Math.sub(orders[_bestBid].qty, securityTraded);
                            orders[_ref].qty = 0;
                            orders[_bestBid].status = IOrder.OrderStatus.PartlyFilled;
                            orders[_ref].status = IOrder.OrderStatus.Filled;  
                            reportTrade(_ref, _bestBid, _bestBidPrice, securityTraded, currencyTraded);
                            reorder(0, _trade); //order ref is removed from market order list as its qty becomes zero
                            if(orders[_ref].otype == IOrder.OrderType.Market)
                                return calcTraded(_ref, orders[_ref].party, false);
                        }    
                        else{
                            securityTraded = currencyTraded.divDown(_bestBidPrice);
                            orders[_ref].qty = Math.sub(orders[_ref].qty, currencyTraded);
                            orders[_bestBid].qty = 0;
                            orders[_bestBid].status = IOrder.OrderStatus.Filled;
                            orders[_ref].status = IOrder.OrderStatus.PartlyFilled;   
                            reportTrade(_ref, _bestBid, _bestBidPrice, securityTraded, currencyTraded);                     
                            reorder(_bidIndex, orders[_marketOrders[_bidIndex]].otype); //bid order ref is removed from market order list as its qty becomes zero
                        }
                    }
                }
            } 
            else if (orders[_ref].order == IOrder.Order.Buy){            
                if (_bestOffer != "") {
                    if(orders[_ref].tokenIn==_currency && orders[_ref].swapKind==IVault.SwapKind.GIVEN_IN && orders[_ref].currencyBalance>=orders[_ref].qty){
                        if(orders[_bestOffer].tokenIn==_security && orders[_bestOffer].swapKind==IVault.SwapKind.GIVEN_IN){
                            currencyTraded = orders[_bestOffer].qty.mulDown(_bestOfferPrice); // calculating amount of currency that can taken out    
                        } else if (orders[_bestOffer].tokenOut==_currency && orders[_bestOffer].swapKind==IVault.SwapKind.GIVEN_OUT){
                            currencyTraded = orders[_bestOffer].qty; // amount of currency to take out (tokenOut) is already there 
                        }
                        if(currencyTraded >= orders[_ref].qty){
                            currencyTraded = orders[_ref].qty;
                            securityTraded = orders[_ref].qty.divDown(_bestOfferPrice);
                            orders[_bestOffer].qty = orders[_bestOffer].tokenOut ==_currency &&  orders[_bestOffer].swapKind == IVault.SwapKind.GIVEN_OUT ? 
                                                    Math.sub(orders[_bestOffer].qty, orders[_ref].qty) : Math.sub(orders[_bestOffer].qty, securityTraded);
                            orders[_ref].qty = 0;
                            orders[_bestOffer].status = IOrder.OrderStatus.PartlyFilled;
                            orders[_ref].status = IOrder.OrderStatus.Filled;  
                            reportTrade(_ref, _bestOffer, _bestOfferPrice, securityTraded, currencyTraded);
                            reorder(0, _trade); //order ref is removed from market order list as its qty becomes zero
                            if(orders[_ref].otype == IOrder.OrderType.Market)
                                return calcTraded(_ref, orders[_ref].party, true);
                        }    
                        else{
                            securityTraded = currencyTraded.divDown(_bestOfferPrice);
                            orders[_ref].qty = Math.sub(orders[_ref].qty, currencyTraded);
                            orders[_bestOffer].qty = 0;
                            orders[_bestOffer].status = IOrder.OrderStatus.Filled;
                            orders[_ref].status = IOrder.OrderStatus.PartlyFilled;    
                            reportTrade(_ref, _bestOffer, _bestOfferPrice, securityTraded, currencyTraded);                    
                            reorder(_bidIndex, orders[_marketOrders[_bidIndex]].otype); //bid order ref is removed from market order list as its qty becomes zero
                        }                    
                    }
                    else if(orders[_ref].tokenOut==_security && orders[_ref].swapKind==IVault.SwapKind.GIVEN_OUT){
                        if(orders[_bestOffer].tokenOut==_currency && orders[_bestOffer].swapKind==IVault.SwapKind.GIVEN_OUT){
                            securityTraded = orders[_bestOffer].qty.divDown(_bestOfferPrice); // calculating amount of security that needs to be sent in to take out currency (tokenOut)
                        } else if(orders[_bestOffer].tokenIn==_security && orders[_bestOffer].swapKind==IVault.SwapKind.GIVEN_IN){
                            securityTraded = orders[_bestOffer].qty; // amount of security sent in (tokenIn) is already there
                        }
                        if(securityTraded >= orders[_ref].qty){
                            securityTraded = orders[_ref].qty;
                            currencyTraded = orders[_ref].qty.mulDown(_bestOfferPrice);
                            orders[_bestOffer].qty = orders[_bestOffer].tokenIn ==_security && orders[_bestOffer].swapKind == IVault.SwapKind.GIVEN_IN ? 
                                                    Math.sub(orders[_bestOffer].qty, orders[_ref].qty) : Math.sub(orders[_bestOffer].qty, currencyTraded);
                            orders[_ref].qty = 0;
                            orders[_bestOffer].status = IOrder.OrderStatus.PartlyFilled;
                            orders[_ref].status = IOrder.OrderStatus.Filled;  
                            reportTrade(_ref, _bestOffer, _bestOfferPrice, securityTraded, currencyTraded);
                            reorder(0, _trade); //order ref is removed from market order list as its qty becomes zero
                            if(orders[_ref].otype == IOrder.OrderType.Market)
                                return calcTraded(_ref, orders[_ref].party, false);   
                        }    
                        else{
                            currencyTraded = securityTraded.mulDown(_bestOfferPrice);
                            orders[_ref].qty = Math.sub(orders[_ref].qty, securityTraded);
                            orders[_bestOffer].qty = 0;
                            orders[_bestOffer].status = IOrder.OrderStatus.Filled;
                            orders[_ref].status = IOrder.OrderStatus.PartlyFilled;
                            reportTrade(_ref, _bestOffer, _bestOfferPrice, securityTraded, currencyTraded);
                            reorder(_bidIndex, orders[_marketOrders[_bidIndex]].otype); //bid order ref is removed from market order list as its qty becomes zero
                        }
                    }                
                }
            }
        }
        delete _marketOrders;
    }

    function reportTrade(bytes32 _ref, bytes32 _cref, uint256 _price, uint256 securityTraded, uint256 currencyTraded) private {
        _previousTs = _previousTs + 1;
        uint256 oIndex = _previousTs;
        ITrade.trade memory tradeToReport = ITrade.trade({
            partyRef: _ref,
            partySwapIn: orders[_ref].swapKind==IVault.SwapKind.GIVEN_IN ? true : false,
            partyTokenIn: orders[_ref].tokenIn==_security ? "security" : "currency",
            partyInAmount: orders[_ref].tokenIn==_security ? securityTraded : currencyTraded,
            party: orders[_ref].party,
            counterpartyRef: _cref, 
            counterpartySwapIn: orders[_cref].swapKind==IVault.SwapKind.GIVEN_IN ? true : false,
            counterpartyTokenIn: orders[_cref].tokenIn==_security ? "security" : "currency",
            counterpartyInAmount: orders[_cref].tokenIn==_security ? securityTraded : currencyTraded,
            counterparty: orders[_cref].party, 
            security: _security,
            currency: _currency,
            price: _price,
            otype: orders[_ref].otype,
            dt: oIndex
        });                 
        tradeRefs[orders[_ref].party][oIndex] = tradeToReport;
        tradeRefs[orders[_cref].party][oIndex] = tradeToReport;        
        emit CallSwap(  orders[_ref].swapKind==IVault.SwapKind.GIVEN_IN ? true : false,
                        orders[_ref].tokenIn==_security ? "security" : "currency",
                        orders[_ref].party, 
                        orders[_cref].swapKind==IVault.SwapKind.GIVEN_IN ? true : false,
                        orders[_cref].tokenIn==_security ? "security" : "currency",
                        orders[_cref].party, 
                        oIndex
                    );
        trades[orders[_ref].party].push(oIndex);
        trades[orders[_cref].party].push(oIndex);
    }

    function calcTraded(bytes32 _ref, address _party, bool currencyTraded) private returns(uint256){
        uint256 oIndex;
        uint256 volume;
        ITrade.trade memory tradeReport;
        for(uint256 i=0; i<trades[_party].length; i++){
            oIndex = trades[_party][i];
            tradeReport = tradeRefs[_party][oIndex];
            if(tradeReport.partyRef==_ref){
                uint256 amount = currencyTraded ? tradeReport.counterpartyInAmount : tradeReport.partyInAmount;
                volume = Math.add(volume, amount);
            }
            delete trades[_party][i];
            delete tradeRefs[_party][oIndex];
        }
        return volume; 
    }   

    function getTrade(address _party, uint256 _timestamp) public view returns(ITrade.trade memory){
        require(msg.sender==owner() || msg.sender==_party, "Unauthorized access to trades");
        return tradeRefs[_party][_timestamp];
    }

    function getTrades() public view returns(uint256[] memory){
        return trades[msg.sender];
    }

    function removeTrade(address _party, uint256 _timestamp) public onlyOwner {
        for(uint256 i=0; i<trades[_party].length; i++){
            if(trades[_party][i]==_timestamp)
                delete trades[_party][i];
        }
    }

    function revertTrade(
        bytes32 _orderRef,
        uint256 _qty,
        Order _order
    ) onlyOwner external override {
        require(_order == Order.Buy || _order == Order.Sell);
        orders[_orderRef].qty = orders[_orderRef].qty + _qty;
        orders[_orderRef].status = OrderStatus.Open;
        //push to order book
        if (orders[_orderRef].otype == IOrder.OrderType.Market) {
            _marketOrders.push(_orderRef);
            matchOrders(_orderRef, IOrder.OrderType.Market);
        } else if (orders[_orderRef].otype == IOrder.OrderType.Limit) {
            _limitOrderIndex[_orderRef] = _limitOrders.length;
            _limitOrders.push(_orderRef);
            checkLimitOrders(_orderRef, IOrder.OrderType.Limit);
        } else if (orders[_orderRef].otype == IOrder.OrderType.Stop) {
            _stopOrderIndex[_orderRef] = _stopOrders.length;
            _stopOrders.push(_orderRef);
            checkStopOrders(_orderRef, IOrder.OrderType.Stop);
        }
    }

    function orderFilled(bytes32 partyRef, bytes32 counterpartyRef) onlyOwner external override {
        delete _userOrderRefs[orders[partyRef].party][_userOrderIndex[partyRef]];
        delete _userOrderIndex[partyRef];
        delete orders[partyRef];
        delete _orderRefs[_orderIndex[partyRef]];
        delete _orderIndex[partyRef];
        delete _userOrderRefs[orders[counterpartyRef].party][_userOrderIndex[counterpartyRef]];
        delete _userOrderIndex[counterpartyRef];
        delete orders[counterpartyRef];
        delete _orderRefs[_orderIndex[counterpartyRef]];
        delete _orderIndex[counterpartyRef];
    }

    function tradeSettled(
        bytes32 partyRef,
        bytes32 counterpartyRef
    ) onlyOwner external override {
        orders[partyRef].status = OrderStatus.Filled;
        orders[counterpartyRef].status = OrderStatus.Filled;
    }

}