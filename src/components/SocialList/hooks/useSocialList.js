import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';

import { socialUrl, requestUrl } from '../../../utils/urlList';

const useSocialList = (list, toCount, defaultUrl, isSubscribe) => {
	const [countList, setCountList] = useState([]);
	const [copyLink, setCopyLink] = useState('');

	const request = async (name, url) => {
		try {
			if (name !== 'telegram') {
				const { data } = await axios.get(requestUrl(url)[name]);
				const count = name === 'facebook' ? data.engagement.share_count : data.count;

				return Number(count);
			}
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error(e);
		}
	};
	const requestCount = useCallback(
		async (url) => {
			setCountList(list);

			const newList = await Promise.all(
				list.map(async ({ name, textButton, utm, onClick, defaultUrl }) => {
					if(isSubscribe) {
						return {
							name,
							textButton,
							url: defaultUrl,
							onClick
						}
					} else {
						const urlItem = socialUrl(utm ? url + utm : url)[name];

						if (name === 'copy') {
							return {
								name,
								textButton,
								onClick: async (e) => {
									try {
										await navigator.clipboard.writeText(`${copyLink}`);

										if (onClick) {
											onClick(e, 'success');
										}
									} catch (e) {
										if (onClick) {
											onClick(e, 'error');
										}
									}
								}
							};
						}

						return {
							name,
							textButton,
							url: urlItem,
							count: toCount ? await request(name, url) : null,
							onClick
						};
					}
				})
			);

			setCountList(newList);
		},
		[copyLink, list, toCount]
	);

	useEffect(() => {
		const url = defaultUrl || document.location.href;

		setCopyLink(url);
		requestCount(url);
	}, [defaultUrl, list, requestCount, setCopyLink]);

	return {
		countList
	};
};

export default useSocialList;
