          <div style={{margin:"20px 20px 0",padding:"16px 20px",background:"rgba(255,107,43,0.08)",border:"1px solid rgba(255,107,43,0.2)",borderRadius:14,textAlign:"center"}}>
            <p style={{fontSize:"0.85rem",fontWeight:300,color:"#fff",lineHeight:1.7,margin:0,fontStyle:"italic"}}>"Every session counts. Keep showing up."</p>
          </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {/* Name */}
            <h2 style={{
              fontFamily: "'DM Sans', system-ui",
              fontSize: '1.6rem', fontWeight: 700, color: TEXT,
              margin: '0 0 6px', letterSpacing: '-0.02em',
            }}>
              {user?.name || 'User'}
            </h2>

            {/* Pro badge or Free */}
            {isPro ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: `linear-gradient(135deg, ${ORANGE}22, ${YELLOW}22)`,
                border: `1px solid ${ORANGE}44`,
                borderRadius: '20px', padding: '4px 14px',
              }}>
                <Zap size={13} color={YELLOW} fill={YELLOW} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: YELLOW, letterSpacing: '0.08em' }}>
                  PRO MEMBER
                </span>
              </div>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: SURFACE2, border: `1px solid ${BORDER}`,
                borderRadius: '20px', padding: '4px 14px',
              }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: GREEN }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: MUTED }}>
                  Free Member
                </span>
              </div>
            )}

            {/* Member since */}
            <p style={{ fontSize: '12px', color: MUTED, marginTop: '8px', fontFamily: "'DM Sans', system-ui" }}>
              Member since {memberSinceDate}
            </p>
          </div>

          {/* Pro upgrade card — only for free */}
          {!isPro && (
            <div style={{ padding: '16px 20px 0' }}>
              <button
                onClick={() => { navigate('/client/upgrade'); onClose(); }}
                style={{
                  width: '100%', border: 'none', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${ORANGE}, ${YELLOW})`,
                  borderRadius: '14px', padding: '16px 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: 'rgba(0,0,0,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Zap size={20} color={TEXT} fill={TEXT} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: 800, fontSize: '15px', color: '#000', margin: 0 }}>
                      Upgrade to BrazilFit Pro
                    </p>
                    <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)', margin: '2px 0 0' }}>
                      Unlock all meals, tips & features
                    </p>
                  </div>
                </div>
                <ChevronRight size={20} color="#000" />
              </button>
            </div>
          )}

          {/* Stats row */}
          <div style={{margin:'20px 20px 0',padding:'16px 20px',background:'rgba(255,107,43,0.08)',border:'1px solid rgba(255,107,43,0.2)',borderRadius:14,textAlign:'center'}}>
            <p style={{fontSize:'0.85rem',fontWeight:300,color:'#fff',lineHeight:1.7,margin:0,fontStyle:'italic'}}>"Every session counts. Keep showing up."</p>
          </div>























          {/* Sign out */}
          <div style={{ padding: '20px 20px 0' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', border: `1px solid rgba(239,68,68,0.2)`,
                borderRadius: '12px', padding: '14px 20px',
                background: 'rgba(239,68,68,0.06)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
            >
              <LogOut size={16} color="#ef4444" />
              <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '14px' }}>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
