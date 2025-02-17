import	React, {ReactElement, ReactNode}	from	'react';
import	Image								from	'next/image';
import	{useWeb3}							from	'@yearn-finance/web-lib/contexts';
import	{copyToClipboard, toAddress}		from	'@yearn-finance/web-lib/utils';
import	{AddressWithActions, Card}			from	'@yearn-finance/web-lib/components';
import	useYearn 							from	'contexts/useYearn';
import	AnomaliesSection					from	'components/VaultBox.AnomaliesSection';
import	StatusLine							from	'components/VaultBox.StatusLine';
import	ModalFix							from	'components/modals/ModalFix';
import	type {TFixModalData, TSettings}		from 'types/types';

const		defaultFixModalData: TFixModalData = {
	isOpen: false,
	fix: {
		category: '',
		address: '0x0000000000000000000000000000000000000000',
		name: '',
		instructions: []
	}
};

function	VaultBox({vault, settings, noStrategies}: {vault: any, settings: TSettings, noStrategies?: boolean}): ReactElement | null {
	const	{aggregatedData} = useYearn();
	const	{chainID} = useWeb3();
	const	[fixModalData, set_fixModalData] = React.useState<TFixModalData>(defaultFixModalData);

	function	getChainExplorer(): string {
		if (chainID === 250) {
			return ('https://ftmscan.com');
		} else if (chainID === 42161) {
			return ('https://arbiscan.io');
		} 
		return ('https://etherscan.io');
	}

	const		hasAnomalies = (
		vault.strategies.length === 0
		|| !aggregatedData[toAddress(vault.address)]?.hasValidIcon
		|| !aggregatedData[toAddress(vault.address)]?.hasValidTokenIcon
		|| !aggregatedData[toAddress(vault.address)]?.hasLedgerIntegration
		|| !aggregatedData[toAddress(vault.address)]?.hasValidStrategiesDescriptions
		|| !aggregatedData[toAddress(vault.address)]?.hasValidStrategiesRisk
	);

	function	onTriggerModalForLedger(): void {
		set_fixModalData({
			isOpen: true,
			fix: {
				category: 'ledger',
				address: vault.address,
				name: vault.name,
				instructions: [
					<span key={'step-1'}>
						{'1. Access the Ledger\'s B2C file for Yearn on GitHub: '}
						<a href={'https://github.com/LedgerHQ/app-plugin-yearn/blob/develop/tests/yearn/b2c.json'} target={'_blank'} className={'underline'} rel={'noreferrer'}>
							{'https://github.com/LedgerHQ/app-plugin-yearn/blob/develop/tests/yearn/b2c.json'}
						</a>
					</span>,
					<span key={'step-3'}>
						{'2. Append the following snippet at the end of the '}
						<code
							onClick={(): void => copyToClipboard('contracts')}
							className={'cursor-copy rounded-md bg-neutral-200 py-1 px-2 text-sm'}>
							{'contracts'}
						</code>
						{' object in the '}
						<code
							onClick={(): void => copyToClipboard('b2c.json')}
							className={'cursor-copy rounded-md bg-neutral-200 py-1 px-2 text-sm'}>
							{'b2c.json'}
						</code>
						{'file.'}
					</span>,
					<span key={'step-3'}>
						{'3. Access the Ledger\'s ABIs folder for Yearn on GitHub: '}
						<a href={'https://github.com/LedgerHQ/app-plugin-yearn/tree/develop/tests/yearn/abis'} target={'_blank'} className={'underline'} rel={'noreferrer'}>
							{'https://github.com/LedgerHQ/app-plugin-yearn/tree/develop/tests/yearn/abis'}
						</a>
					</span>,
					<span key={'step-3'}>
						{'4. Clone and rename '}
						<code
							onClick={(): void => copyToClipboard('_vault_v0.4.3.json')}
							className={'cursor-copy rounded-md bg-neutral-200 py-1 px-2 text-sm'}>
							{'_vault_v0.4.3.json'}
						</code>
						{' to '}
						<code
							onClick={(): void => copyToClipboard(`${vault.address}.json`)}
							className={'cursor-copy rounded-md bg-neutral-200 py-1 px-2 text-sm'}>
							{`${vault.address}.json`}
						</code>
					</span>
				]
			}
		});
	}
	function	onTriggerModalForDescription(currentStrategy: {name: string, address: string}): void {
		set_fixModalData({
			isOpen: true,
			fix: {
				category: 'description',
				address: vault.address,
				name: vault.name,
				instructions: [
					<span key={'step-1'}>
						{'1. Access the Strategies folder in the meta repo: '}
						<a href={`https://github.com/yearn/yearn-meta/tree/master/data/strategies/${chainID}`} target={'_blank'} className={'underline'} rel={'noreferrer'}>
							{`https://github.com/yearn/yearn-meta/tree/master/data/strategies/${chainID}`}
						</a>
					</span>,
					<span key={'step-3'}>
						{'2. Select the file in which the strategy '}
						<code
							onClick={(): void => copyToClipboard(currentStrategy.name)}
							className={'cursor-copy rounded-md bg-neutral-200 py-1 px-2 text-sm'}>
							{currentStrategy.name}
						</code>
						{' should belong to.'}
					</span>,
					<span key={'step-3'}>
						{'3a. If the file exists, append the address of the strategy to the file, under "addresses": '}
						<code
							onClick={(): void => copyToClipboard(currentStrategy.address)}
							className={'cursor-copy rounded-md bg-neutral-200 py-1 px-2 text-sm'}>
							{currentStrategy.address}
						</code>
					</span>,
					<span key={'step-3'}>
						{'3b. If the file does not exists, create a new one and append the address of the strategy to the file, under "addresses": '}
						<code
							onClick={(): void => copyToClipboard(currentStrategy.address)}
							className={'cursor-copy rounded-md bg-neutral-200 py-1 px-2 text-sm'}>
							{currentStrategy.address}
						</code>
					</span>
				]
			}
		});
	}

	if (!hasAnomalies && settings.shouldShowOnlyAnomalies) {
		return null;
	}
	return (
		<Card variant={'background'}>
			<div className={'flex flex-row space-x-4'}>
				<div className={'h-10 min-h-[40px] w-10 min-w-[40px] rounded-full bg-neutral-200'}>
					{vault.icon ? 
						<Image
							src={vault.icon}
							width={40}
							height={40} /> : 
						<Image
							src={`https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/1/${vault.address}/logo-128.png`}
							width={40}
							height={40} />}
				</div>
				<div className={'-mt-1 flex flex-col'}>
					<div className={'flex flex-row items-center space-x-2'}>
						<h4 className={'text-lg font-bold text-neutral-700'}>{vault.name}</h4>
						<p className={'text-sm opacity-60'}>{`(v${vault.version})`}</p>
					</div>
					<div className={'hidden md:flex'}>
						<AddressWithActions
							className={'text-sm font-normal'}
							truncate={0}
							address={vault.address} />
					</div>
					<div className={'flex md:hidden'}>
						<AddressWithActions
							className={'text-sm font-normal'}
							truncate={8}
							address={vault.address} />
					</div>
				</div>
			</div>

			<AnomaliesSection
				label={'Icon'}
				settings={settings}
				anomalies={[{
					isValid: aggregatedData[toAddress(vault.address)]?.hasValidIcon,
					prefix: 'Icon',
					sufix: 'for vault'
				}, {
					isValid: aggregatedData[toAddress(vault.address)]?.hasValidTokenIcon,
					prefix: 'Icon',
					sufix: 'for underlying token'
				}]} />

			<AnomaliesSection
				label={'Ledger Live'}
				settings={settings}
				anomalies={[{
					isValid: aggregatedData[toAddress(vault.address)]?.hasLedgerIntegration,
					onClick: onTriggerModalForLedger,
					prefix: 'Ledger integration',
					sufix: 'for vault'
				}]} />

			{noStrategies ?
				<section aria-label={'strategies check'} className={'mt-3 flex flex-col pl-0 md:pl-14'}>
					<b className={'mb-1 font-mono text-sm text-neutral-500'}>{'Strategies'}</b>
					<StatusLine
						settings={settings}
						isValid={false}
						prefix={'No strategies for this vault:'}
						sufix={''} />
				</section> : null}


			{aggregatedData[toAddress(vault.address)]?.hasValidStrategiesRisk && settings.shouldShowOnlyAnomalies ? null : (
				<section aria-label={'strategies check'} className={'mt-3 flex flex-col pl-0 md:pl-14'}>
					<b className={'mb-1 font-mono text-sm text-neutral-500'}>{'Risk Score'}</b>
					{vault.strategies.map((strategy: any): ReactNode => {
						const	hasRiskFramework = (strategy.risk.TVLImpact + strategy.risk.auditScore + strategy.risk.codeReviewScore + strategy.risk.complexityScore + strategy.risk.longevityImpact + strategy.risk.protocolSafetyScore + strategy.risk.teamKnowledgeScore + strategy.risk.testingScore) > 0;
						return (
							<StatusLine
								key={`${strategy.address}_risk`}
								settings={settings}
								isValid={hasRiskFramework}
								prefix={'Risk'}
								sufix={(
									<span>
										{'for strategy '}
										<a href={`${getChainExplorer()}/address/${strategy.address}`} target={'_blank'} className={`underline ${hasRiskFramework ? '' : 'text-red-900'}`} rel={'noreferrer'}>
											{strategy.name}
										</a>
									</span>
								)} />
								
						);
					})}
				</section>
			)}

			{aggregatedData[toAddress(vault.address)]?.hasValidStrategiesDescriptions && settings.shouldShowOnlyAnomalies ? null : (
				<section aria-label={'strategies check'} className={'mt-3 flex flex-col pl-0 md:pl-14'}>
					<b className={'mb-1 font-mono text-sm text-neutral-500'}>{'Descriptions'}</b>
					{vault.strategies.map((strategy: any): ReactNode => {
						const	isMissingDescription = strategy.description === '';

						return (
							<StatusLine
								key={`${strategy.address}_description`}
								onClick={(): void => onTriggerModalForDescription(strategy)}
								settings={settings}
								isValid={!isMissingDescription}
								prefix={'Description'}
								sufix={(
									<span>
										{'for strategy '}
										<a href={`${getChainExplorer()}/address/${strategy.address}`} target={'_blank'} className={`underline ${!isMissingDescription ? '' : 'text-red-900'}`} rel={'noreferrer'}>
											{strategy.name}
										</a>
									</span>
								)} />
						);
					})}
				</section>
			)}

			<ModalFix
				fix={fixModalData.fix}
				isOpen={fixModalData.isOpen}
				onClose={(): void => set_fixModalData(defaultFixModalData)} />
		</Card>
	);
}

export default VaultBox;