const { checkQuality, findCheapestSkin, getPriceAndVolume, getData, convert, combainToName, uniteCurrency, mergeSort } = require('../utils/functions');
const { qualities, rarities, avg_floats } = require('../utils/variables');
const fetch = require('node-fetch');

const Skin = require('../models/skinModel');
const Case = require('../models/caseModel');
const ServerInfo = require('../models/serverInfoModel');

// NUMBER BY WHICH YOU NEED TO MULTIPLY TO SIMULATE MONEY THAT YOU ARE LEFT WITH, AFTER STEAM TAXES YOUR SELLING
const steamTax = 0.87;
const steamBaseUrl = 'https://steamcommunity.com/market/listings/730/';
const updatingDaysSpan = 7;

// module.exports.showMain = async (req, res, next) => {
//    // console.log(req.user)
//    const researchesName = await Name.find({});
//    const { skinsUpdateInfo } = await ServerInfo.findOne({});
//    // res.cookie('testtoken', 'lol');
//    // res.cookie('testtoken', { amount1: 4, amount2: 6 });
//    // console.log(JSON.parse(req.cookies.testtoken))
//    // res.clearCookie("testtoken");
//    // console.log(req.cookies.testtoken)
//    req.flash('info', `Dla Twojej wygody wyświetlone zostało niewięcej niż ${maxShownSkins} możliwych kontraktów`);
//    // console.log(req.session)
//    res.render('main', { researchesName, skinsUpdateInfo });
// };

module.exports.showSkinsDb = async (req, res) => {
    const collections = await Case.find({})
        .populate({ path: 'skins', populate: { path: 'grey', model: 'Skin' } })
        .populate({ path: 'skins', populate: { path: 'light_blue', model: 'Skin' } })
        .populate({ path: 'skins', populate: { path: 'blue', model: 'Skin' } })
        .populate({ path: 'skins', populate: { path: 'purple', model: 'Skin' } })
        .populate({ path: 'skins', populate: { path: 'pink', model: 'Skin' } })
        .populate({ path: 'skins', populate: { path: 'red', model: 'Skin' } });

    res.render('database', { collections, qualities, rarities });
}

module.exports.checkEmptyPrices = async (req, res) => {
    const emptySkins = [];

    const skins = await Skin.find({ $or: [{ "prices.Factory New": 0 }, { "prices.Minimal Wear": 0 }, { "prices.Field-Tested": 0 }, { "prices.Well-Worn": 0 }, { "prices.Battle-Scarred": 0 }] })
    const stattrakSkins = await Skin.find({ isInStattrak: true, $or: [{ "stattrakPrices.Factory New": 0 }, { "stattrakPrices.Minimal Wear": 0 }, { "stattrakPrices.Field-Tested": 0 }, { "stattrakPrices.Well-Worn": 0 }, { "stattrakPrices.Battle-Scarred": 0 }] })

    for (let skin of skins) {
        emptySkins.push({ name: skin.name, skin: skin.skin, case: skin.case })
    }
    for (let skin of stattrakSkins) {
        emptySkins.push({ name: skin.name, skin: skin.skin, case: skin.case })
    }

    res.locals.emptySkins = emptySkins;
    const err = {
        message: 'Some of skins have invalid prices',
        statusCode: 500
    }

    res.render('error', { err, emptySkins })
}

// might work later as a prices update in one request
module.exports.getSkinsIcons = async (req, res) => {
    const skins = await Skin.find({});
    const data = await getData('http://csgobackpack.net/api/GetItemsList/v2?prettyprint=true&currency=PLN&details=true', 0);
    let iconBaseUrl = 'http://cdn.steamcommunity.com/economy/image/';

    if (data.success) {

        for (let skin of skins) {
            const icon = {
                'Factory New': null,
                'Minimal Wear': null,
                'Field-Tested': null,
                'Well-Worn': null,
                'Battle-Scarred': null,
            }
            for (let quality of qualities) {
                if (skin.prices[quality] != -1) {
                    const details = data.items_list[combainToName(skin.name, skin.skin, quality)];
                    if (details) {
                        const iconUrl = encodeURI(iconBaseUrl + details.icon_url)
                        icon[quality] = iconUrl;
                    }

                }

            }


            const updatedSkin = await Skin.findByIdAndUpdate(skin._id, { icon })

        }
        res.json({ success: true, random: Math.random() })
    }
    else {

        res.json({ success: false, random: Math.random() })
    }
    // if (data.success) {
    //    for (let skin of skins) {
    //       const icon = {
    //          'Factory New': null,
    //          'Minimal Wear': null,
    //          'Field-Tested': null,
    //          'Well-Worn': null,
    //          'Battle-Scarred': null,
    //       }
    //       for (let quality of qualities) {

    //          if (skin.prices.quality == -1) {

    //             // const iconUrl = encodeURI(iconBaseUrl + data.items_list[combainToName(skin.name, skin.skin, quality)].icon_url);
    //             // iconUrl != undefined ? icon.quality = iconUrl : null;
    //             console.log(combainToName(skin.name, skin.skin, quality));
    //          }
    //       }
    //    }
    //    res.json({ success: true })
    // }
    // else { res.json({ success: false }); }



}

module.exports.updatePrices = async (req, res, next) => {
    //does not supprot steam's volumes
    const { start = 0, end = length, variant = 'backpack', stattrak = 'false' } = req.query;
    console.log(stattrak)
    const skins = await Skin.find({});


    let count = 0, length = 0;
    let reqNumber = 0;

    for (let item of skins) {
        count += 1;

        if (count >= start && count <= end) {
            console.log(`${count} / ${end} - ${item.name} | ${item.skin} - ${reqNumber}`);

            const updatedPrices = {};
            const updatedStattrakPrices = {};

            const updatedVolumes = {};
            const updatedStattrakVolumes = {};
            // let updatedIcon;

            const { name, skin, _id } = item;
            // const volume = [updatingDaysSpan];

            for (let quality of qualities) {

                if (item.prices[quality] !== -1) {

                    let baseUrl;
                    variant == 'steam' ? baseUrl = 'https://steamcommunity.com/market/priceoverview/?appid=730&currency=6&market_hash_name=' : baseUrl = `http://csgobackpack.net/api/GetItemPrice/?currency=PLN&icon=1&time=${updatingDaysSpan}&id=`;
                    const url = `${baseUrl}${name} | ${skin} (${quality})`;
                    const encodedUrl = encodeURI(url);

                    let data;
                    variant == 'steam' ? data = await getData(encodedUrl, 3200) : data = await getData(encodedUrl, 500);
                    reqNumber += 1;

                    const { newPrice, newVolume } = await getPriceAndVolume(data, variant, url, convert, getData);
                    // const { newPrice, newVolume, icon } = await getPriceAndVolume(data, variant, url, convert, getData);


                    // icon != null ? updatedIcon = icon : null;
                    // console.log(updatedIcon)
                    updatedPrices[quality] = newPrice;
                    updatedVolumes[quality] = Math.round(newVolume / updatingDaysSpan);

                    if (updatedPrices[quality].statusCode && updatedPrices[quality].statusCode === 429) { return next(updatedPrices[quality]) }
                } else {
                    updatedPrices[quality] = -1;
                }

                if (stattrak == 'true' && item.isInStattrak) {
                    if (item.stattrakPrices[quality] !== -1) {

                        let baseUrl;
                        variant == 'steam' ? baseUrl = 'https://steamcommunity.com/market/priceoverview/?appid=730&currency=6&market_hash_name=StatTrak™ ' : baseUrl = 'http://csgobackpack.net/api/GetItemPrice/?currency=PLN&time=2&id=StatTrak™ ';
                        const url = `${baseUrl}${name} | ${skin} (${quality})`;
                        const encodedUrl = encodeURI(url);

                        let data;
                        variant == 'steam' ? data = await getData(encodedUrl, 3200) : data = await getData(encodedUrl, 500);
                        reqNumber += 1;

                        const { newPrice, newVolume } = await getPriceAndVolume(data, variant, url, convert, getData);
                        // const { newPrice, newVolume, icon } = await getPriceAndVolume(data, variant, url, convert, getData);

                        // icon != null ? updatedIcon = icon : null;
                        updatedStattrakPrices[quality] = newPrice;
                        updatedStattrakVolumes[quality] = Math.round(newVolume / updatingDaysSpan);


                        if (updatedStattrakPrices[quality].statusCode && updatedStattrakPrices[quality].statusCode === 429) { return next(updatedStattrakPrices[quality]) }
                        console.log(`------------ StatTrak™ ${item.name} | ${item.skin} - ${quality}`);
                    } else {
                        updatedStattrakPrices[quality] = -1;
                    }
                }

            }



            if (stattrak == 'true') {
                const updatedSkin = await Skin.findByIdAndUpdate(_id, { prices: updatedPrices, stattrakPrices: updatedStattrakPrices, volumes: updatedVolumes, stattrakVolumes: updatedStattrakVolumes }, { new: true });
                // const updatedSkin = await Skin.findByIdAndUpdate(_id, { prices: updatedPrices, stattrakPrices: updatedStattrakPrices, volumes: updatedVolumes, stattrakVolumes: updatedStattrakVolumes, icon: updatedIcon }, { new: true });
            } else {
                // const updatedSkin = await Skin.findByIdAndUpdate(_id, { prices: updatedPrices, volumes: updatedVolumes, stattrakVolumes: updatedStattrakVolumes, icon: updatedIcon }, { new: true });
                const updatedSkin = await Skin.findByIdAndUpdate(_id, { prices: updatedPrices, volumes: updatedVolumes, stattrakVolumes: updatedStattrakVolumes }, { new: true });
            }

        }


    }

    console.log('updating finished!')
    res.redirect('/skins');
};

module.exports.updateSkinPrice = async (req, res) => {
    const { id } = req.params;
    const { currency } = req.session;
    let { prices, stattrakPrices } = req.body;

    console.log(prices, stattrakPrices)

    let updatedSkin;
    if (stattrakPrices != undefined) {
        prices = uniteCurrency(prices, currency);
        stattrakPrices = uniteCurrency(stattrakPrices, currency);
        updatedSkin = await Skin.findByIdAndUpdate(id, { prices, stattrakPrices }, { new: true });
    } else {
        prices = uniteCurrency(prices, currency);
        updatedSkin = await Skin.findByIdAndUpdate(id, { prices }, { new: true });
    }

    req.flash('success', `${updatedSkin.name} ${updatedSkin.skin}'s prices successfully updated`);
    res.redirect('/skins/database');
}

module.exports.databaseUpdate = async (req, res) => {
    const data = await (await fetch('http://csgobackpack.net/api/GetItemsList/v2?currency=PLN&prettyprint=true,details=true')).json()
    const list = data.items_list
    const skins = await Skin.find({})
    let counter = 0

    if (data.success == false) {
        req.flash('error', 'Cannot retrieve a json data from backpack api')
        res.redirect('/user/account')
    }

    for (let item of skins) {
        ++counter
        const updatedPrices = {};
        const updatedStattrakPrices = {};

        const updatedVolumes = {};
        const updatedStattrakVolumes = {};

        const { name, skin, _id } = item;

        for (quality of qualities) {
            const key = `${name} | ${skin} (${quality})`
            let arg = {}
            if (list[key] && list[key].price && list[key].price["24_hours"]) arg = list[key].price["24_hours"]
            else if (list[key] && list[key].price && list[key].price["7_days"]) arg = list[key].price["7_days"]
            else if (list[key] && list[key].price && list[key].price["30_days"]) arg = list[key].price["30_days"]
            else if (list[key] && list[key].price && list[key].price["all_time"]) arg = list[key].price["all_time"]

            if (Object.keys(arg).length) {
                updatedPrices[quality] = arg.average || 0
                updatedVolumes[quality] = arg.sold || 0
            }

            const stattrakKey = `StatTak\u2122 ` + key
            let arg2 = {}
            if (list[stattrakKey] && list[stattrakkey].price && list[stattrakKey].price["24_hours"]) arg2 = list[stattrakKey].price["24_hours"]
            else if (list[stattrakKey] && list[stattrakkey].price && list[stattrakKey].price["7_days"]) arg2 = list[stattrakKey].price["7_days"]
            else if (list[stattrakKey] && list[stattrakkey].price && list[stattrakKey].price["30_days"]) arg2 = list[stattrakKey].price["30_days"]
            else if (list[stattrakKey] && list[stattrakkey].price && list[stattrakKey].price["all_time"]) arg2 = list[stattrakKey].price["all_time"]

            if (Object.keys(arg2).length) {
                updatedStattrakPrices[quality] = arg2.average || 0
                updatedStattrakVolumes[quality] = arg2.sold || 0
            }

        }

        const updatedSkin = await Skin.findByIdAndUpdate(_id, { prices: updatedPrices, stattrakPrices: updatedStattrakPrices, volumes: updatedVolumes, stattrakVolumes: updatedStattrakVolumes }, { new: true });
    }

    req.flash('success', 'Updated all database')
    res.redirect('/user/account')
}

module.exports.useServers = async (req, res) => {
    const server2 = { start: 0, end: 100 };
    const server3 = { start: 100, end: 200 };
    const server4 = { start: 200, end: 300 };
    const server5 = { start: 300, end: 400 };
    const server6 = { start: 400, end: 500 };
    const server7 = { start: 500, end: 550 };
    const server8 = { start: 550, end: 800 };
    const server9 = { start: 800, end: 950 };
    const server10 = { start: 950, end: 1100 };
    const variant = 'backpack';
    const stattrak = true;


    console.log(variant)
    console.log(server2)
    console.log(server3)
    console.log(server4)
    console.log(server5)
    console.log(server6)
    console.log(server7)
    console.log(server8)
    console.log(server9)
    console.log(server10)
    console.log(variant)
    console.log(stattrak)

    const date = new Date();
    const skinsUpdateInfo = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}  -  ${date.getHours()} : ${date.getMinutes()}`;


    await ServerInfo.findOneAndUpdate({}, { outerServerInfo: { valid: true }, skinsUpdateInfo, lastChanged: new Date() }, { new: true });


    const server2Url = `https://steam-market2.herokuapp.com/skins/update?start=${server2.start}&end=${server2.end}&variant=${variant}&stattrak=${stattrak}`;
    const server3Url = `https://steam-market3.herokuapp.com/skins/update?start=${server3.start}&end=${server3.end}&variant=${variant}&stattrak=${stattrak}`;
    const server4Url = `https://steam-market4.herokuapp.com/skins/update?start=${server4.start}&end=${server4.end}&variant=${variant}&stattrak=${stattrak}`;
    const server5Url = `https://steam-market5.herokuapp.com/skins/update?start=${server5.start}&end=${server5.end}&variant=${variant}&stattrak=${stattrak}`;
    const server6Url = `https://steam-market6.herokuapp.com/skins/update?start=${server6.start}&end=${server6.end}&variant=${variant}&stattrak=${stattrak}`;
    const server7Url = `https://steam-market7.herokuapp.com/skins/update?start=${server7.start}&end=${server7.end}&variant=${variant}&stattrak=${stattrak}`;
    const server8Url = `https://steam-market8.herokuapp.com/skins/update?start=${server8.start}&end=${server8.end}&variant=${variant}&stattrak=${stattrak}`;
    const server9Url = `https://steam-market9.herokuapp.com/skins/update?start=${server9.start}&end=${server9.end}&variant=${variant}&stattrak=${stattrak}`;
    const server10Url = `https://steam-market10.herokuapp.com/skins/update?start=${server10.start}&end=${server10.end}&variant=${variant}&stattrak=${stattrak}`;

    const response2 = fetch(server2Url, {
        method: 'GET',
        headers: {
            'auth-token': process.env.HEADERS_TOKEN
        }
    });
    const response3 = fetch(server3Url, {
        method: 'GET',
        headers: {
            'auth-token': process.env.HEADERS_TOKEN
        }
    });
    const response4 = fetch(server4Url, {
        method: 'GET',
        headers: {
            'auth-token': process.env.HEADERS_TOKEN
        }
    });
    const response5 = fetch(server5Url, {
        method: 'GET',
        headers: {
            'auth-token': process.env.HEADERS_TOKEN
        }
    });
    const response6 = fetch(server6Url, {
        method: 'GET',
        headers: {
            'auth-token': process.env.HEADERS_TOKEN
        }
    });
    const response7 = fetch(server7Url, {
        method: 'GET',
        headers: {
            'auth-token': process.env.HEADERS_TOKEN
        }
    });
    const response8 = fetch(server8Url, {
        method: 'GET',
        headers: {
            'auth-token': process.env.HEADERS_TOKEN
        }
    });
    const response9 = fetch(server9Url, {
        method: 'GET',
        headers: {
            'auth-token': process.env.HEADERS_TOKEN
        }
    });
    const response10 = fetch(server10Url, {
        method: 'GET',
        headers: {
            'auth-token': process.env.HEADERS_TOKEN
        }
    });

    req.flash('success', 'Updating skins prices! ESTIMATED TIME : 15 minutes')
    res.redirect('/explore')
};





// NOT CURRENTLY USED
// module.exports.prepareTrades = async (req, res) => {
//    let counter = 0;
//    const collections = await Case.find({})
//       .populate({ path: 'skins', populate: { path: 'grey', model: 'Skin' } })
//       .populate({ path: 'skins', populate: { path: 'light_blue', model: 'Skin' } })
//       .populate({ path: 'skins', populate: { path: 'blue', model: 'Skin' } })
//       .populate({ path: 'skins', populate: { path: 'purple', model: 'Skin' } })
//       .populate({ path: 'skins', populate: { path: 'pink', model: 'Skin' } })
//       .populate({ path: 'skins', populate: { path: 'red', model: 'Skin' } });

//    const nOfSkins = {};
//    for (let collection of collections) {
//       nOfSkins[collection.name] = {
//          grey: collection.skins.grey.length,
//          light_blue: collection.skins.light_blue.length,
//          blue: collection.skins.blue.length,
//          purple: collection.skins.purple.length,
//          pink: collection.skins.pink.length,
//          red: collection.skins.red.length,
//       }
//    }

//    let profit = [];
//    for (let collection of collections) {



//       for (let r = 0; r < rarities.length - 1; r++) {
//          // SKINY Z OBECNEJ RZADKOŚCI
//          let skins = collection.skins[rarities[r]];
//          // SKINY Z KOLEJNEJ RZADKOŚCI
//          let targetedSkins = collection.skins[rarities[r + 1]];

//          for (let quality of qualities) {

//             for (let skin of skins) {
//                if (skin.prices[quality] !== -1) {
//                   let total = 0;
//                   let tradesArr = [];
//                   let trade = {};
//                   let isProfitable = false;

//                   for (let targetedSkin of targetedSkins) {
//                      // SPRAWDZA CZY ŚREDNIA NIE WYKRACZA POZA MIN I MAX FLOAT SKINA DO TRADÓW
//                      let avg = avg_floats[quality];
//                      avg < skin.min_float ? avg = skin.min_float : null;
//                      avg > skin.max_float ? avg = skin.max_float : null;

//                      const float = (targetedSkin.max_float - targetedSkin.min_float) * avg + targetedSkin.min_float;
//                      const targetedQuality = checkQuality(float);

//                      const rawPrice = skin.prices[quality];
//                      const price = Math.round(skin.prices[quality] * 10 * 100) / 100;
//                      const targetedPrice = Math.round(targetedSkin.prices[targetedQuality] * steamTax * 100) / 100;
//                      total += targetedPrice;
//                      counter += 1;

//                      if (price < targetedPrice) {
//                         isProfitable = true;
//                         trade = {
//                            skin,
//                            quality,
//                            targetedSkin,
//                            targetedQuality,
//                            rawPrice,
//                            price,
//                            targetedPrice,
//                         };
//                         tradesArr.push(trade);
//                      }

//                   }

//                   if (isProfitable) {
//                      let nOfTargetedSkins = nOfSkins[collection.name][rarities[r + 1]];
//                      let instance = {
//                         tradesArr,
//                         total: Math.round(total * 100) / 100,
//                         nOfTargetedSkins,
//                         chance: Math.round(100 / nOfTargetedSkins),
//                      }
//                      profit.push(instance);
//                   }

//                }
//             }

//          }





//       }
//    }
//    console.log(counter)
//    res.render('trades/trades', { profit, shortcuts });
// }





const mixedThreePairs = async (req) => {
    const { ratio = '4-4-2', sliceStart = 0, sliceEnd = 10, sort = 'returnPercentage' } = req.query;
    let amount1 = Number(ratio[0]);
    let amount2 = Number(ratio[2]);
    let amount3 = Number(ratio[4]);
    if (amount1 == undefined || amount2 == undefined || amount3 == undefined || amount1 + amount2 + amount3 != 10) {
        amount1 = 4;
        amount2 = 4;
        amount3 = 2;
    }

    const sliceFrom = Number(sliceStart);
    const sliceTo = Number(sliceEnd);
    let counter = 0;
    let profits = [];

    let collections = await Case.find({})
        .populate({ path: 'skins', populate: { path: 'grey', model: 'Skin' } })
        .populate({ path: 'skins', populate: { path: 'light_blue', model: 'Skin' } })
        .populate({ path: 'skins', populate: { path: 'blue', model: 'Skin' } })
        .populate({ path: 'skins', populate: { path: 'purple', model: 'Skin' } })
        .populate({ path: 'skins', populate: { path: 'pink', model: 'Skin' } })
        .populate({ path: 'skins', populate: { path: 'red', model: 'Skin' } });

    collections = collections.slice(sliceFrom, sliceTo);
    // collections = [...collections.slice(0, 7), ...collections.slice(46, 51)]

    for (let r = 0; r < rarities.length - 1; r++) {

        for (let firstCollection of collections) {
            if (firstCollection.skins[rarities[r + 1]].length !== 0) {

                for (let secondCollection of collections) {
                    if (secondCollection.skins[rarities[r + 1]].length !== 0) {
                        for (let thirdCollection of collections) {
                            if (thirdCollection.skins[rarities[r + 1]].length !== 0) {

                                for (let firstQuality of qualities) {
                                    for (let secondQuality of qualities) {
                                        for (let thirdQuality of qualities) {



                                            const firstSkin = findCheapestSkin(firstCollection, rarities[r], firstQuality);
                                            const secondSkin = findCheapestSkin(secondCollection, rarities[r], secondQuality);
                                            const thirdSkin = findCheapestSkin(thirdCollection, rarities[r], thirdQuality);

                                            if (firstSkin != null && secondSkin != null && thirdSkin != null) {

                                                let firstSkinAvgFloat = avg_floats[firstQuality];
                                                let secondSkinAvgFloat = avg_floats[secondQuality];
                                                let thirdSkinAvgFloat = avg_floats[thirdQuality];
                                                if (firstSkinAvgFloat > firstSkin.max_float) firstSkinAvgFloat = firstSkin.max_float;
                                                if (firstSkinAvgFloat < firstSkin.min_float) firstSkinAvgFloat = firstSkin.min_float;
                                                if (secondSkinAvgFloat > secondSkin.max_float) secondSkinAvgFloat = secondSkin.max_float;
                                                if (secondSkinAvgFloat < secondSkin.min_float) secondSkinAvgFloat = secondSkin.min_float;
                                                if (thirdSkinAvgFloat > thirdSkin.max_float) thirdSkinAvgFloat = thirdSkin.max_float;
                                                if (thirdSkinAvgFloat < thirdSkin.min_float) thirdSkinAvgFloat = thirdSkin.min_float;

                                                const avg = Math.round(((amount1 * firstSkinAvgFloat + amount2 * secondSkinAvgFloat + amount3 * thirdSkinAvgFloat) / 10) * 1000) / 1000;
                                                const firstPrice = firstSkin.prices[firstQuality];
                                                const secondPrice = secondSkin.prices[secondQuality];
                                                const thirdPrice = thirdSkin.prices[thirdQuality];
                                                const inputPrice = Math.round((amount1 * firstPrice + amount2 * secondPrice + amount3 * thirdPrice) * 100) / 100;

                                                let wantedOutputChance = 0;

                                                let targetedSkinsArr = [];
                                                let targetedSkinsNumber = 0;
                                                let total = 0;
                                                let targetedSkinsQuality = []

                                                let max = 0;
                                                let maxSkin = {};


                                                for (let targetedCollection of collections) {
                                                    if (targetedCollection.name == firstSkin.case || targetedCollection.name == secondSkin.case || targetedCollection.name == thirdSkin.case) {

                                                        for (let targetedSkin of targetedCollection.skins[rarities[r + 1]]) {

                                                            const { min_float, max_float } = targetedSkin;
                                                            const float = Math.round(((max_float - min_float) * avg + min_float) * 1000) / 1000;
                                                            const targetedQuality = checkQuality(float);

                                                            const targetedPrice = Math.round((targetedSkin.prices[targetedQuality] * steamTax) * 100) / 100;
                                                            targetedSkin.price = targetedPrice;
                                                            if (max < targetedPrice) {
                                                                max = targetedPrice;
                                                                maxSkin = {
                                                                    _id: targetedSkin._id,
                                                                    name: targetedSkin.name,
                                                                    skin: targetedSkin.skin,
                                                                    case: targetedSkin.case,
                                                                    rarity: targetedSkin.rarity,
                                                                    min_float: targetedSkin.min_float,
                                                                    max_float: targetedSkin.max_float,
                                                                    price: targetedPrice,
                                                                    targetedQuality
                                                                }
                                                            }

                                                            if (targetedCollection.name == firstSkin.case && targetedCollection.name == secondSkin.case && targetedCollection.name == thirdSkin.case) {
                                                                total += (targetedPrice * (amount1 + amount2 + amount3));
                                                                targetedSkinsNumber += (1 * (amount1 + amount2 + amount3));
                                                                targetedPrice > inputPrice ? wantedOutputChance += (amount1 + amount2 + amount3) : null;

                                                            } else if (targetedCollection.name == secondSkin.case && targetedCollection.name == thirdSkin.case) {
                                                                total += (targetedPrice * (amount2 + amount3));
                                                                targetedSkinsNumber += (1 * (amount2 + amount3));
                                                                targetedPrice > inputPrice ? wantedOutputChance += (amount2 + amount3) : null;

                                                            } else if (targetedCollection.name == firstSkin.case && targetedCollection.name == thirdSkin.case) {
                                                                total += (targetedPrice * (amount1 + amount3));
                                                                targetedSkinsNumber += (1 * (amount1 + amount3));
                                                                targetedPrice > inputPrice ? wantedOutputChance += (amount1 + amount3) : null;

                                                            } else if (targetedCollection.name == firstSkin.case && targetedCollection.name == secondSkin.case) {
                                                                total += (targetedPrice * (amount1 + amount2));
                                                                targetedSkinsNumber += (1 * (amount1 + amount2));
                                                                targetedPrice > inputPrice ? wantedOutputChance += (amount1 + amount2) : null;

                                                            } else if (targetedCollection.name == firstSkin.case) {
                                                                total += (targetedPrice * amount1);
                                                                targetedSkinsNumber += (1 * amount1);
                                                                targetedPrice > inputPrice ? wantedOutputChance += (amount1) : null;

                                                            } else if (targetedCollection.name == secondSkin.case) {
                                                                total += (targetedPrice * amount2);
                                                                targetedSkinsNumber += (1 * amount2);
                                                                targetedPrice > inputPrice ? wantedOutputChance += (amount2) : null;

                                                            } else if (targetedCollection.name == thirdSkin.case) {
                                                                total += (targetedPrice * amount3);
                                                                targetedSkinsNumber += (1 * amount3);
                                                                targetedPrice > inputPrice ? wantedOutputChance += (amount3) : null;
                                                            }

                                                            const targetedSkinPom = {
                                                                _id: targetedSkin._id,
                                                                name: targetedSkin.name,
                                                                skin: targetedSkin.skin,
                                                                prices: targetedSkin.prices,
                                                                min_float: targetedSkin.min_float,
                                                                max_float: targetedSkin.max_float,
                                                                rarity: targetedSkin.rarity,
                                                                price: targetedPrice,
                                                                float

                                                            }
                                                            targetedSkinsQuality.push(targetedQuality);
                                                            targetedSkinsArr.push(targetedSkinPom);
                                                            counter += 1;
                                                        }
                                                    }
                                                }






                                                const avgPrice = total / targetedSkinsNumber;
                                                const profitPerTradeUp = Math.round((avgPrice - inputPrice) * 100) / 100;
                                                const returnPercentage = Math.round(((avgPrice) / inputPrice * 100) * 100) / 100;

                                                if (profitPerTradeUp > 0) {

                                                    const trade = {
                                                        skin: firstSkin,
                                                        cooperativeSkin: secondSkin,
                                                        cooperativeSkin: secondSkin,
                                                        thirdSkin,
                                                        targetedSkin: maxSkin,
                                                        quality: firstQuality,
                                                        cooperativeQuality: secondQuality,
                                                        thirdQuality,
                                                        targetedQuality: maxSkin.targetedQuality,
                                                        firstSkinUrl: encodeURI(`${steamBaseUrl}${firstSkin.name} | ${firstSkin.skin} (${firstQuality})`),
                                                        secondSkinUrl: encodeURI(`${steamBaseUrl}${secondSkin.name} | ${secondSkin.skin} (${secondQuality})`),
                                                        thirdSkinUrl: encodeURI(`${steamBaseUrl}${thirdSkin.name} | ${thirdSkin.skin} (${thirdQuality})`),
                                                        targetedSkinUrl: encodeURI(`${steamBaseUrl}${maxSkin.name} | ${maxSkin.skin} (${maxSkin.targetedQuality})`),
                                                        price: firstPrice,
                                                        cooperativePrice: secondPrice,
                                                        thirdPrice,
                                                        inputPrice,
                                                        targetedPrice: maxSkin.price,
                                                        rarity: rarities[r],
                                                        targetedSkinsArr,
                                                        targetedSkinsQuality,
                                                        // chance,
                                                        profitPerTradeUp,
                                                        returnPercentage,
                                                    }

                                                    const pom2 = {
                                                        trade,
                                                        avg,
                                                        total,
                                                        targetedSkinsNumber,
                                                        wantedOutputChance
                                                    }

                                                    profits = placeInCorrectOrder(profits, pom2, sort);
                                                }

                                                counter += 1;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    // for (let profit of profits) {
    //    console.log(profit.trades[0].returnPercentage)
    // }

    let counterOpt = counter.toLocaleString()
    let positiveResults = profits.length.toLocaleString();

    console.log(counter, positiveResults)
    return { profits: profits.slice(0, 4250), counterOpt, positiveResults, amount: { amount1, amount2, amount3 } };
}